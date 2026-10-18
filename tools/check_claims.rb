#!/usr/bin/env ruby
# frozen_string_literal: true

# Checks the living archive's claims files before the site builds (A-T10).
# Each aired episode can have _data/claims/<episode-file-name>.yml listing its
# predictions, their current verdicts and a dated verdict history. A history
# entry without a date or a source, a made-up verdict, or a claims file for an
# episode that hasn't aired is a build error.
#
# Usage: ruby tools/check_claims.rb [claims-dir] [episodes-dir]
#        (defaults: _data/claims and _episodes)
# CI runs it through `ruby tools/check_episodes.rb`, which checks both.
# The field reference is docs/claims-schema.md.

require "date"
require "yaml"
# Guarded: check_episodes.rb also loads this file when it runs as a script.
require_relative "check_episodes" unless defined?(VERDICTS)

STATUSES = %w[open closed].freeze

def load_claims(path)
  YAML.safe_load(File.read(path), permitted_classes: [Date]) || {}
rescue Psych::Exception => e
  raise ArgumentError, "not valid YAML (#{e.message.lines.first.strip})"
end

def text?(value)
  value.is_a?(String) && !value.strip.empty?
end

def history_problems(history, label, today)
  return ["#{label}.history: needs at least one dated entry (the day it aired)"] unless history.is_a?(Array) && !history.empty?

  problems = []
  previous = nil
  history.each_with_index do |entry, i|
    where = "#{label}.history[#{i}]"
    next problems << "#{where}: must be a mapping with date, verdict, change and sources" unless entry.is_a?(Hash)

    date = entry["date"]
    if !date.is_a?(Date)
      problems << "#{where}: date must be a date (YYYY-MM-DD)"
    else
      problems << "#{where}: date #{date} is in the future; add the entry once it has happened" if date > today
      problems << "#{where}: dates must run oldest first (#{date} comes after #{previous})" if previous && date < previous
      previous = date
    end
    problems << "#{where}: verdict must be one of: #{VERDICTS.join(', ')}" unless VERDICTS.include?(entry["verdict"])
    problems << "#{where}: change must say what changed" unless text?(entry["change"])

    sources = entry["sources"]
    if !sources.is_a?(Array) || sources.empty?
      problems << "#{where}: needs at least one source (title and https url)"
    else
      sources.each_with_index do |source, j|
        ok = source.is_a?(Hash) && text?(source["title"]) && https_url?(source["url"])
        problems << "#{where}.sources[#{j}]: needs a title and a url starting with https://" unless ok
      end
    end

    video = entry["video"]
    if video && !(https_url?(video) && VIDEO_HOSTS.include?(host(video)))
      problems << "#{where}: video must be a published YouTube or TikTok URL (https://)"
    end
  end
  problems
end

def claim_problems(claim, label, today)
  return ["#{label}: must be a mapping"] unless claim.is_a?(Hash)

  problems = []
  problems << "#{label}: missing id" unless text?(claim["id"])
  problems << "#{label}: missing claim (the prediction, word for word)" unless text?(claim["claim"])
  problems << "#{label}: missing who (who said it, where, when)" unless text?(claim["who"])
  problems << "#{label}: status must be one of: #{STATUSES.join(', ')}" unless STATUSES.include?(claim["status"])
  problems << "#{label}: verdict must be one of: #{VERDICTS.join(', ')}" unless VERDICTS.include?(claim["verdict"])
  problems.concat(history_problems(claim["history"], label, today))

  last = claim["history"].is_a?(Array) && claim["history"].last
  if last.is_a?(Hash) && VERDICTS.include?(last["verdict"]) && last["verdict"] != claim["verdict"]
    problems << "#{label}: verdict #{claim['verdict'].inspect} doesn't match the latest history entry (#{last['verdict'].inspect})"
  end
  problems
end

def claims_file_problems(data, episode, today)
  return ["must be a mapping with episode and claims"] unless data.is_a?(Hash)

  problems = placeholder_problems(data)
  problems << "episode must be #{episode['number']}, the number on its episode page" unless data["episode"] == episode["number"]

  claims = data["claims"]
  return problems << "claims: needs at least one claim" unless claims.is_a?(Array) && !claims.empty?

  claims.each_with_index { |claim, i| problems.concat(claim_problems(claim, "claims[#{i}]", today)) }
  ids = claims.filter_map { |c| c["id"] if c.is_a?(Hash) }
  ids.tally.each { |id, count| problems << "claim id #{id} is used #{count} times" if count > 1 }

  # The first claim is the episode's own prediction: one verdict, everywhere.
  first = claims.first
  if first.is_a?(Hash) && VERDICTS.include?(first["verdict"]) && first["verdict"] != episode["verdict"]
    problems << "claims[0] verdict #{first['verdict'].inspect} doesn't match the episode page (#{episode['verdict'].inspect}); update both together"
  end
  problems
end

def check_claims(claims_dir, episodes_dir, today: Date.today)
  failures = {}
  Dir.glob(File.join(claims_dir, "*.yml")).sort.each do |path|
    slug = File.basename(path, ".yml")
    page = File.join(episodes_dir, "#{slug}.md")
    episode = File.exist?(page) ? front_matter(page) : nil
    unless episode.is_a?(Hash)
      failures[path] = ["no episode page #{page}; add claims only after the episode has aired and its page is published"]
      next
    end
    if !episode["publish_date"].is_a?(Date) || episode["publish_date"] > today || episode["status"] != "published"
      failures[path] = ["#{page} isn't published yet; claims go public only after the episode airs"]
      next
    end
    problems = claims_file_problems(load_claims(path), episode, today)
    failures[path] = problems unless problems.empty?
  rescue ArgumentError => e
    failures[path] = [e.message]
  end
  failures
end

if $PROGRAM_NAME == __FILE__
  claims_dir = ARGV[0] || "_data/claims"
  episodes_dir = ARGV[1] || "_episodes"
  failures = check_claims(claims_dir, episodes_dir)
  failures.each do |path, problems|
    problems.each { |problem| warn "FAIL: #{path}: #{problem}" }
  end
  if failures.empty?
    puts "OK: every claims file in #{claims_dir} has valid verdicts, dates and sources."
  else
    warn "Fix the fields above. The field reference is docs/claims-schema.md."
    exit 1
  end
end
