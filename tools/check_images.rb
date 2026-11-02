#!/usr/bin/env ruby
# Fails when any episode, special or podcast entry has no image, or names an
# image that isn't in _data/images.yml or whose files are missing. Jakes's
# rule (2 Nov 2026): every entry always has a real picture, never a blank box.
require "yaml"
require "date"
root = File.expand_path("..", __dir__)
load = ->(f) { YAML.safe_load(File.read(File.join(root, f)), permitted_classes: [Date, Time]) || {} }
images = load.("_data/images.yml")
stills = load.("_data/episode_stills.yml")
errors = []
check = lambda do |label, name|
  if name.nil? || name.to_s.strip.empty?
    errors << "#{label}: no image set"
  elsif !images.key?(name)
    errors << "#{label}: image '#{name}' is not in _data/images.yml"
  else
    Array(images[name]["widths"]).each do |w|
      %w[jpg webp].each do |ext|
        f = "assets/img/#{name}-#{w}.#{ext}"
        errors << "#{label}: missing #{f}" unless File.exist?(File.join(root, f))
      end
    end
  end
end
Dir[File.join(root, "_episodes", "*.md")].sort.each do |path|
  slug = File.basename(path, ".md")
  fm = YAML.safe_load(File.read(path).split(/^---\s*$/)[1], permitted_classes: [Date, Time]) || {}
  name = fm.dig("still", "image") || stills.dig(slug, "image")
  check.("_episodes/#{slug}.md", name)
end
Array(load.("_data/specials.yml")).each { |s| check.("_data/specials.yml #{s['id']}", s["image"]) }
pod = File.join(root, "_data", "podcasts.yml")
Array(load.("_data/podcasts.yml")).each { |p| check.("_data/podcasts.yml #{p['id']}", p["image"]) } if File.exist?(pod)
if errors.empty?
  puts "check_images: every episode, special and podcast entry has an image"
else
  warn errors.map { |e| "check_images: #{e}" }
  exit 1
end
