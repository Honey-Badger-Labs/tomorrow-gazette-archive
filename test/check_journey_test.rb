# frozen_string_literal: true

# Feeds the journey check bad `journey:` fields and expects it to refuse.
# Run through test/check_episodes_test.rb (CI runs that file only).
require "minitest/autorun"
require "tmpdir"
require_relative "../tools/check_journey"

class CheckJourneyTest < Minitest::Test
  FIXTURE = File.read(File.join(__dir__, "fixtures/valid/e1-test-episode.md"))
  SPECIAL = {
    "id" => "test-special", "prediction" => { "quote" => "q", "who" => "w", "when" => 1920, "where" => "x" },
    "sources" => [{ "title" => "t", "url" => "https://example.org/" }],
    "journey" => { "motif" => "phone", "label" => "Spirit phone", "fact" => "Nothing was found.", "source" => 1 }
  }.freeze

  def with_journey(yaml)
    FIXTURE.sub(/^verdict:/, "#{yaml}\nverdict:")
  end

  def problems_for(episode: FIXTURE, specials: [])
    Dir.mktmpdir do |dir|
      File.write(File.join(dir, "e1.md"), episode)
      specials_file = File.join(dir, "specials.yml")
      File.write(specials_file, specials.to_yaml)
      check_journey(dir, specials_file).values.flatten
    end
  end

  def test_motif_names_come_from_the_shapes_script
    assert_includes journey_motifs, "flyingcar"
    assert_includes journey_motifs, "sunburst"
  end

  def test_episode_without_journey_passes
    assert_empty problems_for
  end

  def test_valid_episode_journey_passes
    assert_empty problems_for(episode: with_journey("journey:\n  motif: flyingcar\n  label: Flying car\n  since: 1"))
  end

  def test_unknown_motif_is_refused
    problems = problems_for(episode: with_journey("journey:\n  motif: teleporter"))
    assert(problems.any? { |p| p.include?("is not a motif") })
  end

  def test_since_out_of_range_is_refused
    problems = problems_for(episode: with_journey("journey:\n  since: 9"))
    assert(problems.any? { |p| p.include?("journey.since") })
  end

  def test_long_label_is_refused
    problems = problems_for(episode: with_journey("journey:\n  label: A label far too long for a phone"))
    assert(problems.any? { |p| p.include?("journey.label") })
  end

  def test_valid_special_passes
    assert_empty problems_for(specials: [SPECIAL])
  end

  def test_special_without_fact_is_refused
    special = SPECIAL.merge("journey" => SPECIAL["journey"].merge("fact" => ""))
    assert(problems_for(specials: [special]).any? { |p| p.include?("journey.fact") })
  end

  def test_special_source_out_of_range_is_refused
    special = SPECIAL.merge("journey" => SPECIAL["journey"].merge("source" => 3))
    assert(problems_for(specials: [special]).any? { |p| p.include?("journey.source") })
  end
end
