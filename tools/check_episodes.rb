#!/usr/bin/env ruby
# frozen_string_literal: true

# Checks every episode page's front matter before the site builds (A-T8).
# An episode that fails never reaches the public site: a draft, a claim
# without a source or a made-up verdict is a build error, not a warning.
#
# Usage: ruby tools/check_episodes.rb [episodes-dir]   (default: _episodes)
# The field reference is docs/episode-schema.md.

require "date"
require "yaml"

VERDICTS = ["NAILED IT", "PARTLY RIGHT", "NOT YET", "COMPLETELY BONKERS"].freeze
REQUIRED = %w[number title status publish_date description video prediction verdict verdict_reason sources].freeze
VIDEO_HOSTS = %w[www.youtube.com youtube.com youtu.be www.tiktok.com].freeze
PLACEHOLDER = "TODO-"

def front_matter(path)
  text = File.read(path)
  match = text.match(/\A---\s*\n(.*?)\n---\s*(\n|\z)/m)
  return nil unless match

  YAML.safe_load(match[1], permitted_classes: [Date]) || {}
rescue Psych::Exception => e
  raise ArgumentError, "front matter is not valid YAML (#{e.message.lines.first.strip})"
end

def https_url?(value)
  value.is_a?(String) && value.match?(%r{\Ahttps://[^\s/]+\.[^\s/]+})
end

def host(url)
  url[%r{\Ahttps://([^/]+)}, 1]
end

def source_problems(sources)
  return ["sources: needs at least one source"] unless sources.is_a?(Array) && !sources.empty?

  sources.each_with_index.flat_map do |source, i|
    label = "sources[#{i}]"
    next ["#{label}: must be a mapping with id, title, url and accessed"] unless source.is_a?(Hash)

    problems = []
    problems << "#{label}: missing id" unless source["id"].is_a?(String) && !source["id"].empty?
    problems << "#{label}: missing title" unless source["title"].is_a?(String) && !source["title"].strip.empty?
    problems << "#{label}: url must start with https://" unless https_url?(source["url"])
    problems << "#{label}: accessed must be a date (YYYY-MM-DD)" unless source["accessed"].is_a?(Date)
    problems
  end
end

# Every claim names its sources by id; each id must exist on the page.
def citation_problems(data, source_ids)
  problems = []
  cited = []

  prediction = data["prediction"]
  if prediction.is_a?(Hash) && %w[quote who when where source].all? { |f| !prediction[f].to_s.strip.empty? }
    cited << prediction["source"]
  else
    problems << "prediction: needs quote, who, when, where and source"
  end

  Array(data["since"]).each_with_index do |item, i|
    if item.is_a?(Hash) && !item["fact"].to_s.strip.empty? && item["sources"].is_a?(Array) && !item["sources"].empty?
      cited.concat(item["sources"])
    else
      problems << "since[#{i}]: each fact needs text and at least one source id"
    end
  end

  cited.uniq.each do |id|
    problems << "cites #{id.inspect}, which is not in sources" unless source_ids.include?(id)
  end
  problems
end

# Drafts mark unknown values (a video link before upload) with TODO-.
# Look everywhere, nested values included, so none reaches the site.
def placeholder_problems(value, path = nil)
  case value
  when Hash then value.flat_map { |key, item| placeholder_problems(item, path ? "#{path}.#{key}" : key.to_s) }
  when Array then value.each_with_index.flat_map { |item, i| placeholder_problems(item, "#{path}[#{i}]") }
  when String
    value.include?(PLACEHOLDER) ? ["#{path}: still has a #{PLACEHOLDER} placeholder; replace it before publishing"] : []
  else []
  end
end

def episode_problems(data, today)
  missing = REQUIRED.reject { |key| data.key?(key) && !data[key].to_s.strip.empty? }
  return missing.map { |key| "missing #{key}" } unless missing.empty?

  problems = placeholder_problems(data)
  problems << "status must be \"published\"; drafts don't belong in this public repo" unless data["status"] == "published"
  problems << "number must be a whole number" unless data["number"].is_a?(Integer)
  problems << "verdict must be one of: #{VERDICTS.join(', ')}" unless VERDICTS.include?(data["verdict"])

  date = data["publish_date"]
  if !date.is_a?(Date)
    problems << "publish_date must be a date (YYYY-MM-DD)"
  elsif date > today
    problems << "publish_date #{date} is in the future; add the page after the episode airs"
  end

  video = data["video"]
  links = video.is_a?(Hash) ? video.values : []
  if links.empty? || !links.all? { |url| https_url?(url) && VIDEO_HOSTS.include?(host(url)) }
    problems << "video: give the published YouTube and/or TikTok URL (https://)"
  end

  sources = data["sources"]
  problems.concat(source_problems(sources))
  ids = sources.is_a?(Array) ? sources.filter_map { |s| s["id"] if s.is_a?(Hash) } : []
  ids.tally.each { |id, count| problems << "source id #{id} is used #{count} times" if count > 1 }
  problems.concat(citation_problems(data, ids))
  problems
end

def check(dir, today: Date.today)
  failures = {}
  numbers = Hash.new { |h, k| h[k] = [] }
  Dir.glob(File.join(dir, "*.md")).sort.each do |path|
    data = front_matter(path)
    problems = data ? episode_problems(data, today) : ["no front matter (the file must start with ---)"]
    numbers[data["number"]] << path if data && data["number"]
    failures[path] = problems unless problems.empty?
  rescue ArgumentError => e
    failures[path] = [e.message]
  end
  numbers.each do |number, paths|
    paths.each { |path| (failures[path] ||= []) << "episode number #{number} is also used by another file" } if paths.size > 1
  end
  failures
end

if $PROGRAM_NAME == __FILE__
  dir = ARGV[0] || "_episodes"
  failures = check(dir)
  failures.each do |path, problems|
    problems.each { |problem| warn "FAIL: #{path}: #{problem}" }
  end
  if failures.empty?
    puts "OK: every episode in #{dir} has the required fields and sources."
  else
    warn "Fix the fields above. The field reference is docs/episode-schema.md."
    exit 1
  end
end
