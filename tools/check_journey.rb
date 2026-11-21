#!/usr/bin/env ruby
# frozen_string_literal: true

# Checks the optional `journey:` fields that place an episode or special on
# the Journey Through Tomorrow page (/journey/). A wrong motif or a pointer
# to a fact that isn't there fails the build instead of showing a broken stop.
# Run by tools/check_episodes.rb, so CI needs no workflow change.
# The field reference is docs/episode-schema.md ("journey").

require "date"
require "yaml"

SHAPES_FILE = File.expand_path("../assets/js/journey-shapes.js", __dir__)
LABEL_MAX = 16 # characters that fit under the slider on a phone

# The motif names live in one place: the shapes script.
def journey_motifs(shapes_file = SHAPES_FILE)
  File.read(shapes_file).scan(/^ {4}(\w+)\(B\) \{/).flatten
end

def journey_common_problems(journey, motifs, image_names = nil)
  return ["journey: must be a mapping (motif, label, ...)"] unless journey.is_a?(Hash)

  problems = []
  if journey.key?("motif") && !motifs.include?(journey["motif"])
    problems << "journey.motif #{journey['motif'].inspect} is not a motif in assets/js/journey-shapes.js (#{motifs.join(', ')})"
  end
  label = journey["label"]
  if journey.key?("label") && !(label.is_a?(String) && !label.strip.empty? && label.length <= LABEL_MAX)
    problems << "journey.label must be short text (#{LABEL_MAX} characters at most)"
  end
  if journey.key?("still")
    still = journey["still"]
    if !(still.is_a?(String) && still.match?(/\A[a-z0-9-]+\z/))
      problems << "journey.still must be an image name from _data/images.yml"
    elsif image_names && !image_names.include?(still)
      problems << "journey.still #{still.inspect} is not in _data/images.yml"
    end
  end
  problems
end

def episode_journey_problems(data, motifs, image_names = nil)
  journey = data["journey"]
  return [] if journey.nil?

  problems = journey_common_problems(journey, motifs, image_names)
  return problems unless journey.is_a?(Hash) && journey.key?("since")

  count = Array(data["since"]).size
  unless journey["since"].is_a?(Integer) && journey["since"].between?(1, count)
    problems << "journey.since must be the number of one of this page's since facts (1 to #{count})"
  end
  problems
end

def special_journey_problems(special, motifs, image_names = nil)
  journey = special["journey"]
  return [] if journey.nil?

  problems = journey_common_problems(journey, motifs, image_names)
  return problems unless journey.is_a?(Hash)

  problems << "journey: needs a prediction on the special to appear on the page" unless special["prediction"].is_a?(Hash)
  problems << "journey.fact: say what happened, in one sentence" unless journey["fact"].is_a?(String) && !journey["fact"].strip.empty?
  count = Array(special["sources"]).size
  unless journey["source"].is_a?(Integer) && journey["source"].between?(1, count)
    problems << "journey.source must be the position of the fact's source in sources (1 to #{count})"
  end
  problems
end

# Returns { label => [problems] } for everything that fails.
def load_image_names(images_file)
  return nil unless images_file && File.exist?(images_file)

  data = YAML.safe_load(File.read(images_file), permitted_classes: [Date, Time]) || {}
  data.is_a?(Hash) ? data.keys.map(&:to_s) : []
end

def check_journey(episodes_dir, specials_file, shapes_file: SHAPES_FILE, images_file: nil, image_names: nil)
  motifs = journey_motifs(shapes_file)
  names = image_names.nil? ? load_image_names(images_file) : image_names
  failures = {}
  Dir.glob(File.join(episodes_dir, "*.md")).sort.each do |path|
    match = File.read(path).match(/\A---\s*\n(.*?)\n---\s*(\n|\z)/m)
    next unless match

    data = YAML.safe_load(match[1], permitted_classes: [Date]) || {}
    problems = episode_journey_problems(data, motifs, names)
    failures[path] = problems unless problems.empty?
  rescue Psych::Exception
    next # check_episodes.rb reports bad YAML
  end
  if File.exist?(specials_file)
    Array(YAML.safe_load(File.read(specials_file), permitted_classes: [Date, Time])).each do |special|
      problems = special_journey_problems(special, motifs, names)
      failures["#{specials_file} #{special['id']}"] = problems unless problems.empty?
    end
  end
  failures
end
