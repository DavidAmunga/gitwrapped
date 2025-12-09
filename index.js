#!/usr/bin/env node
import chalk from "chalk";
import { parseCliArgs, getRepositoryName } from "./src/utils.js";
import {
  getBasicStats,
  getLineStats,
  getContributorStats,
  getTimeBasedStats,
  getCommitFrequencyStats,
  getCommitSizeStats,
  getLanguageStats,
  getFileChurnStats,
  getBranchStats,
} from "./src/stats.js";
import { getStreakStats } from "./src/streaks.js";
import {
  displayBanner,
  displayRepositoryOverview,
  displayTimeline,
  displayContributors,
  displayCodeStats,
  displayCommitFrequency,
  displayTimeAnalysis,
  displayStreakStats,
  displayCommitSizeStats,
  displayFileChurn,
  displayBranchStats,
  displayFunFacts,
  displayFooter,
  createSpinner,
} from "./src/display.js";

/**
 * Main function to run Git Wrapped
 */
async function main() {
  try {
    // Parse command line arguments
    const options = parseCliArgs();
    const verbose = options.verbose;

    // Show help if requested
    if (process.argv.includes("--help") || process.argv.includes("-h")) {
      displayHelp();
      return;
    }

    // Display banner
    const repoName = getRepositoryName(verbose);
    displayBanner(repoName, options);

    // Create spinner for loading
    const spinner = createSpinner("Gathering repository statistics...");
    if (!options.minimal) {
      spinner.start();
    }

    // Collect all statistics
    const allStats = {};

    try {
      // Basic stats
      allStats.basicStats = getBasicStats(options, verbose);

      // Line stats
      allStats.lineStats = getLineStats(verbose);

      // Contributor stats
      allStats.contributors = getContributorStats(options, verbose);

      // Time-based stats
      allStats.timeStats = getTimeBasedStats(options, verbose);

      // Commit frequency stats
      allStats.frequencyStats = getCommitFrequencyStats(options, verbose);

      // Commit size stats
      allStats.sizeStats = getCommitSizeStats(options, verbose);

      // Language stats
      allStats.languageStats = getLanguageStats(verbose);

      // File churn stats
      allStats.fileChurn = getFileChurnStats(options, verbose);

      // Branch stats
      allStats.branchStats = getBranchStats(options, verbose);

      // Streak stats
      allStats.streakStats = getStreakStats(options, verbose);

      if (!options.minimal) {
        spinner.succeed("Statistics gathered successfully!");
      }
    } catch (error) {
      if (!options.minimal) {
        spinner.fail("Failed to gather some statistics");
      }
      if (verbose) {
        console.error(chalk.red("Error:", error.message));
      }
    }

    // Display results in CLI
    displayResults(allStats, options);
  } catch (error) {
    console.error(chalk.red("\n❌ Error running Git Wrapped:"));
    console.error(chalk.red(error.message));
    if (options && options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Display all results in CLI format
 * @param {Object} allStats - All collected statistics
 * @param {Object} options - Display options
 */
function displayResults(allStats, options) {
  // Repository Overview
  if (allStats.basicStats) {
    displayRepositoryOverview(allStats.basicStats, options);
  }

  // Timeline
  if (
    allStats.basicStats &&
    allStats.basicStats.firstCommitDate &&
    allStats.basicStats.lastCommitDate
  ) {
    displayTimeline(
      allStats.basicStats.firstCommitDate,
      allStats.basicStats.lastCommitDate,
      options
    );
  }

  // Contributors
  if (allStats.contributors && allStats.contributors.length > 0) {
    displayContributors(allStats.contributors, options);
  }

  // Code Statistics
  if (allStats.lineStats) {
    displayCodeStats(allStats.lineStats, allStats.languageStats, options);
  }

  // Commit Frequency
  if (allStats.frequencyStats) {
    displayCommitFrequency(allStats.frequencyStats, options);
  }

  // Time-based Analysis
  if (allStats.timeStats) {
    displayTimeAnalysis(allStats.timeStats, options);
  }

  // Streak Statistics
  if (allStats.streakStats) {
    displayStreakStats(allStats.streakStats, options);
  }

  // Commit Size Statistics
  if (allStats.sizeStats && !options.minimal) {
    displayCommitSizeStats(allStats.sizeStats, options);
  }

  // File Churn
  if (allStats.fileChurn && allStats.fileChurn.length > 0 && !options.minimal) {
    displayFileChurn(allStats.fileChurn, options);
  }

  // Branch Statistics
  if (allStats.branchStats && allStats.branchStats.totalBranches > 0) {
    displayBranchStats(allStats.branchStats, options);
  }

  // Fun Facts
  if (!options.minimal) {
    displayFunFacts(allStats, options);
  }

  // Footer
  displayFooter();
}

/**
 * Display help information
 */
function displayHelp() {
  console.log(
    chalk.cyan.bold("\nGit Wrapped - Your Repository's Year in Review\n")
  );
  console.log(chalk.white("Usage: gitwrapped [options]\n"));
  console.log(chalk.white("Options:"));
  console.log(
    chalk.white(
      "  --year <YYYY>           Filter statistics by specific year (e.g., --year 2025)"
    )
  );
  console.log(
    chalk.white("  --all-time              Show all-time statistics (default)")
  );
  console.log(
    chalk.white(
      "  --current-branch-only   Analyze only the current branch (default: all)"
    )
  );
  console.log(
    chalk.white("  --no-emoji              Disable emojis in output")
  );
  console.log(chalk.white("  --minimal               Show condensed output"));
  console.log(chalk.white("  --verbose               Show debug information"));
  console.log(chalk.white("  --help, -h              Show this help message"));
  console.log(chalk.white("\nExamples:"));
  console.log(
    chalk.gray("  gitwrapped                          # All branches (default)")
  );
  console.log(
    chalk.gray(
      "  gitwrapped --year 2025              # 2025 stats, all branches"
    )
  );
  console.log(
    chalk.gray("  gitwrapped --current-branch-only    # Only current branch")
  );
  console.log(
    chalk.gray("  gitwrapped --minimal                # Condensed output")
  );
  console.log(chalk.gray("  gitwrapped --year 2024 --no-emoji"));
  console.log();
}

// Run the main function
main();
