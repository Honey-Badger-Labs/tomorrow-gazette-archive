# frozen_string_literal: true

# Feeds the claims check broken claims files and expects it to refuse.
# Run: ruby test/check_claims_test.rb
require "minitest/autorun"
require "tmpdir"
require_relative "../tools/check_claims"

class CheckClaimsTest < Minitest::Test
  EPISODE = File.read(File.join(__dir__, "fixtures/valid/e1-test-episode.md"))
  CLAIMS = File.read(File.join(__dir__, "fixtures/claims/e1-test-episode.yml"))
  TODAY = Date.new(2026, 10, 15)

  def problems_for(claims, episode: EPISODE, slug: "e1-test-episode")
    Dir.mktmpdir do |dir|
      Dir.mkdir(File.join(dir, "claims"))
      Dir.mkdir(File.join(dir, "episodes"))
      File.write(File.join(dir, "claims", "#{slug}.yml"), claims)
      File.write(File.join(dir, "episodes", "e1-test-episode.md"), episode) if episode
      check_claims(File.join(dir, "claims"), File.join(dir, "episodes"), today: TODAY).values.flatten
    end
  end

  def assert_refused(claims, text, **opts)
    problems = problems_for(claims, **opts)
    assert(problems.any? { |p| p.include?(text) }, "expected a problem containing #{text.inspect}, got #{problems.inspect}")
  end

  def test_valid_claims_pass
    assert_empty problems_for(CLAIMS)
  end

  def test_the_real_claims_files_pass
    assert_empty check_claims(File.join(__dir__, "../_data/claims"), File.join(__dir__, "../_episodes"))
  end

  def test_claims_without_an_episode_page_are_refused
    assert_refused(CLAIMS, "no episode page", slug: "e2-not-aired")
  end

  def test_claims_for_an_episode_not_yet_aired_are_refused
    assert_refused(CLAIMS, "isn't published yet", episode: EPISODE.sub("publish_date: 2026-01-01", "publish_date: 2026-10-29"))
  end

  def test_unknown_verdict_is_refused
    assert_refused(CLAIMS.sub("    verdict: NOT YET", "    verdict: MAYBE"), "verdict must be one of")
  end

  def test_unknown_history_verdict_is_refused
    assert_refused(CLAIMS.sub("        verdict: NOT YET", "        verdict: SORT OF"), "verdict must be one of")
  end

  def test_history_entry_without_a_date_is_refused
    assert_refused(CLAIMS.sub("      - date: 2026-02-01\n", "      - change: x\n"), "date must be a date")
  end

  def test_history_entry_in_the_future_is_refused
    assert_refused(CLAIMS.sub("date: 2026-02-01", "date: 2026-12-01"), "in the future")
  end

  def test_history_out_of_order_is_refused
    assert_refused(CLAIMS.sub("date: 2026-02-01", "date: 2025-12-01"), "oldest first")
  end

  def test_history_entry_without_sources_is_refused
    broken = CLAIMS.sub(/        sources:\n          - title: Test source two\n            url: https:\/\/example.org\/two\n/, "")
    assert_refused(broken, "needs at least one source")
  end

  def test_source_without_https_url_is_refused
    assert_refused(CLAIMS.sub("https://example.org/two", "http://example.org/two"), "url starting with https://")
  end

  def test_empty_history_is_refused
    broken = CLAIMS.sub(/    history:\n.*\z/m, "    history: []\n")
    assert_refused(broken, "needs at least one dated entry")
  end

  def test_verdict_must_match_latest_history_entry
    broken = CLAIMS.sub("    verdict: NOT YET", "    verdict: NAILED IT")
    assert_refused(broken, "doesn't match the latest history entry")
  end

  def test_first_claim_must_match_the_episode_verdict
    episode = EPISODE.sub("verdict: NOT YET", "verdict: NAILED IT")
    assert_refused(CLAIMS, "doesn't match the episode page", episode: episode)
  end

  def test_unknown_status_is_refused
    assert_refused(CLAIMS.sub("status: open", "status: pending"), "status must be one of")
  end

  def test_wrong_episode_number_is_refused
    assert_refused(CLAIMS.sub("episode: 1", "episode: 2"), "episode must be 1")
  end

  def test_bad_video_link_is_refused
    assert_refused(CLAIMS.sub("https://www.youtube.com/shorts/abc", "https://example.org/video"), "video must be")
  end

  def test_placeholder_is_refused
    assert_refused(CLAIMS.sub("https://www.youtube.com/shorts/abc", "TODO-short-link"), "placeholder")
  end

  # A-T11: falsifiers, check results and next actions (Reality Loop rules).
  def test_claim_without_a_falsifier_is_refused
    broken = CLAIMS.sub(/    falsifier:\n(      .*\n){2}/, "")
    assert_refused(broken, "needs a falsifier")
  end

  def test_falsifier_without_a_wrong_side_is_refused
    assert_refused(CLAIMS.sub(/      wrong: .*\n/, ""), "falsifier.wrong")
  end

  def test_inconclusive_is_refused_as_a_verdict
    broken = CLAIMS.sub("    verdict: NOT YET", "    verdict: INCONCLUSIVE")
    assert_refused(broken, "inconclusive is a check result, not a verdict")
  end

  def test_unknown_check_result_is_refused
    assert_refused(CLAIMS.sub("check: unchanged", "check: maybe"), "check must be one of")
  end

  def test_first_entry_must_be_the_airing
    assert_refused(CLAIMS.sub("check: aired", "check: unchanged"), "set `check: aired`")
  end

  def test_an_inconclusive_check_keeps_the_verdict
    broken = CLAIMS.sub("check: unchanged", "check: inconclusive")
                   .sub(/(check: inconclusive)/, '\1')
    assert_empty problems_for(broken)
    moved = broken.sub("        verdict: NOT YET\n        check: inconclusive", "        verdict: NAILED IT\n        check: inconclusive")
                  .sub("    verdict: NOT YET", "    verdict: NAILED IT")
    assert_refused(moved, "can't move the verdict")
  end

  def test_changed_check_must_move_the_verdict
    assert_refused(CLAIMS.sub("check: unchanged", "check: changed"), "use `unchanged`")
  end

  def test_open_claim_needs_a_next_action
    assert_refused(CLAIMS.sub(/        next_action: .*\n/, ""), "needs a next_action")
  end

  def test_closed_claim_needs_no_next_action
    closed = CLAIMS.sub("status: open", "status: closed").sub(/        next_action: .*\n/, "")
    assert_empty problems_for(closed)
  end

  def test_next_action_is_one_line
    assert_refused(CLAIMS.sub("next_action: Check one test source again.", "next_action: |\n          One.\n          Two."), "one action on one line")
  end
end
