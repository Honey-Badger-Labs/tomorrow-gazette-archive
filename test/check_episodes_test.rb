# frozen_string_literal: true

# Feeds the episode check broken front matter and expects it to refuse.
# Run: ruby test/check_episodes_test.rb
require "minitest/autorun"
require "tmpdir"
require "fileutils"
require_relative "../tools/check_episodes"

class CheckEpisodesTest < Minitest::Test
  FIXTURE = File.read(File.join(__dir__, "fixtures/valid/e1-test-episode.md"))
  TODAY = Date.new(2026, 10, 15)

  def problems_for(text, name: "e1.md", extra: {})
    Dir.mktmpdir do |dir|
      File.write(File.join(dir, name), text)
      extra.each { |file, body| File.write(File.join(dir, file), body) }
      check(dir, today: TODAY).values.flatten
    end
  end

  def test_valid_episode_passes
    assert_empty problems_for(FIXTURE)
  end

  def test_empty_directory_passes
    Dir.mktmpdir { |dir| assert_empty check(dir, today: TODAY) }
  end

  def test_draft_is_refused
    problems = problems_for(FIXTURE.sub("status: published", "status: draft"))
    assert(problems.any? { |p| p.include?("drafts don't belong") })
  end

  def test_future_publish_date_is_refused
    problems = problems_for(FIXTURE.sub("publish_date: 2026-01-01", "publish_date: 2026-10-29"))
    assert(problems.any? { |p| p.include?("in the future") })
  end

  def test_unknown_verdict_is_refused
    problems = problems_for(FIXTURE.sub("verdict: NOT YET", "verdict: WAY OFF"))
    assert(problems.any? { |p| p.include?("verdict must be one of") })
  end

  def test_missing_field_is_named
    problems = problems_for(FIXTURE.sub(/^verdict_reason:.*\n/, ""))
    assert_includes problems, "missing verdict_reason"
  end

  def test_fact_without_source_is_refused
    problems = problems_for(FIXTURE.sub("    sources: [S2]\n", ""))
    assert(problems.any? { |p| p.include?("since[0]") })
  end

  def test_citing_an_unknown_source_is_refused
    problems = problems_for(FIXTURE.sub("sources: [S2]", "sources: [S9]"))
    assert_includes problems, 'cites "S9", which is not in sources'
  end

  def test_prediction_without_source_is_refused
    problems = problems_for(FIXTURE.sub("  source: S1\n", ""))
    assert(problems.any? { |p| p.start_with?("prediction:") })
  end

  def test_plain_http_source_is_refused
    problems = problems_for(FIXTURE.sub("https://example.org/survey", "http://example.org/survey"))
    assert(problems.any? { |p| p.include?("url must start with https://") })
  end

  def test_video_must_be_youtube_or_tiktok
    problems = problems_for(FIXTURE.sub("https://www.youtube.com/shorts/TESTFIXTURE", "https://example.org/video"))
    assert(problems.any? { |p| p.start_with?("video:") })
  end

  def test_duplicate_episode_numbers_are_refused
    problems = problems_for(FIXTURE, extra: { "e1-copy.md" => FIXTURE })
    assert(problems.any? { |p| p.include?("also used by another file") })
  end

  def test_missing_front_matter_is_refused
    assert_includes problems_for("Just some text\n"), "no front matter (the file must start with ---)"
  end

  def test_broken_yaml_is_reported_not_raised
    problems = problems_for("---\ntitle: [unclosed\n---\n")
    assert(problems.any? { |p| p.include?("not valid YAML") })
  end
end
