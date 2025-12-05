import chalk from "chalk";
import boxen from "boxen";
import gradient from "gradient-string";
import ora from "ora";
import { formatDate, formatDuration } from "./utils.js";

/**
 * Display the ASCII art banner
 * @param {string} repoName - Repository name
 * @param {Object} options - Display options
 */
export function displayBanner(repoName, options = {}) {
  const asciiArt = `
    ▄▄▄▄    ▄▄▄▄▄▄   ▄▄▄▄▄▄▄▄ ▄▄      ▄▄ ▄▄▄▄▄▄       ▄▄     ▄▄▄▄▄▄    ▄▄▄▄▄▄    ▄▄▄▄▄▄▄▄  ▄▄▄▄▄    
  ██▀▀▀▀█   ▀▀██▀▀   ▀▀▀██▀▀▀ ██      ██ ██▀▀▀▀██    ████    ██▀▀▀▀█▄  ██▀▀▀▀█▄  ██▀▀▀▀▀▀  ██▀▀▀██  
 ██           ██        ██    ▀█▄ ██ ▄█▀ ██    ██    ████    ██    ██  ██    ██  ██        ██    ██ 
 ██  ▄▄▄▄     ██        ██     ██ ██ ██  ███████    ██  ██   ██████▀   ██████▀   ███████   ██    ██ 
 ██  ▀▀██     ██        ██     ███▀▀███  ██  ▀██▄   ██████   ██        ██        ██        ██    ██ 
  ██▄▄▄██   ▄▄██▄▄      ██     ███  ███  ██    ██  ▄██  ██▄  ██        ██        ██▄▄▄▄▄▄  ██▄▄▄██  
    ▀▀▀▀    ▀▀▀▀▀▀      ▀▀     ▀▀▀  ▀▀▀  ▀▀    ▀▀▀ ▀▀    ▀▀  ▀▀        ▀▀        ▀▀▀▀▀▀▀▀  ▀▀▀▀▀    
`;

  const coloredArt = gradient.morning.multiline(asciiArt);
  console.log(coloredArt);

  const subtitle = options.noEmoji
    ? `Your Repository's Year in Review`
    : `📊 Your Repository's Year in Review 📊`;

  console.log(chalk.cyan.bold(subtitle.padStart(subtitle.length + 45)));

  if (repoName && repoName !== "unknown") {
    const repoLine = `Repository: ${repoName}`;
    console.log(chalk.yellow(repoLine.padStart(repoLine.length + 50)));
  }

  console.log();
}

/**
 * Display section header
 * @param {string} title - Section title
 * @param {string} emoji - Emoji for the section
 * @param {Object} options - Display options
 */
export function displaySection(title, emoji = "", options = {}) {
  const displayTitle = options.noEmoji ? title : `${emoji} ${title}`;
  console.log();
  console.log(chalk.cyan.bold.underline(displayTitle));
  console.log(chalk.gray("─".repeat(60)));
}

/**
 * Display repository overview
 * @param {Object} stats - Basic statistics
 * @param {Object} options - Display options
 */
export function displayRepositoryOverview(stats, options = {}) {
  displaySection("REPOSITORY OVERVIEW", "✓", options);

  const emoji = options.noEmoji ? "" : "📊";
  console.log(
    chalk.white(
      `${emoji ? emoji + " " : ""}Total Commits       ${chalk.cyan(
        stats.numCommits
      )}`
    )
  );

  const branchEmoji = options.noEmoji ? "" : "🌿";
  console.log(
    chalk.white(
      `${branchEmoji ? branchEmoji + " " : ""}Branches            ${chalk.cyan(
        stats.numBranches
      )}`
    )
  );

  const prEmoji = options.noEmoji ? "" : "📩";
  console.log(
    chalk.white(
      `${prEmoji ? prEmoji + " " : ""}Pull Requests       ${chalk.cyan(
        stats.numPullRequests
      )}`
    )
  );

  const contributorEmoji = options.noEmoji ? "" : "👥";
  console.log(
    chalk.white(
      `${
        contributorEmoji ? contributorEmoji + " " : ""
      }Contributors        ${chalk.cyan(stats.numContributors)}`
    )
  );

  if (stats.firstCommitDate && stats.lastCommitDate) {
    const ageEmoji = options.noEmoji ? "" : "🎂";
    const startDate = new Date(stats.firstCommitDate);
    const endDate = new Date(stats.lastCommitDate);
    const duration = formatDuration(startDate, endDate);
    console.log(
      chalk.white(
        `${ageEmoji ? ageEmoji + " " : ""}Repository Age      ${chalk.cyan(
          duration
        )}`
      )
    );
  }
}

/**
 * Display timeline information
 * @param {string} firstCommitDate - First commit date
 * @param {string} lastCommitDate - Last commit date
 * @param {Object} options - Display options
 */
export function displayTimeline(firstCommitDate, lastCommitDate, options = {}) {
  displaySection("TIMELINE", "📅", options);

  const startEmoji = options.noEmoji ? "" : "🚀";
  console.log(
    chalk.green(
      `${startEmoji ? startEmoji + " " : ""}First Commit: ${formatDate(
        firstCommitDate
      )}`
    )
  );

  const endEmoji = options.noEmoji ? "" : "🏁";
  console.log(
    chalk.yellow(
      `${endEmoji ? endEmoji + " " : ""}Last Commit:  ${formatDate(
        lastCommitDate
      )}`
    )
  );

  const startDate = new Date(firstCommitDate);
  const endDate = new Date(lastCommitDate);
  const durationEmoji = options.noEmoji ? "" : "⏳";
  console.log(
    chalk.white(
      `${
        durationEmoji ? durationEmoji + " " : ""
      }Duration:     ${formatDuration(startDate, endDate)}`
    )
  );
}

/**
 * Display contributor statistics
 * @param {Array} contributors - Array of contributor stats
 * @param {Object} options - Display options
 */
export function displayContributors(contributors, options = {}) {
  displaySection("CONTRIBUTOR STATISTICS", "👥", options);

  contributors.forEach(({ name, commits }, index) => {
    const medal =
      index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : " ";
    const displayMedal = options.noEmoji ? `${index + 1}.` : medal;
    console.log(
      chalk.white(
        `${displayMedal} ${name.padEnd(30)} ${chalk.cyan(commits + " commits")}`
      )
    );
  });
}

/**
 * Display code statistics
 * @param {Object} lineStats - Line statistics
 * @param {Object} languageStats - Language statistics
 * @param {Object} options - Display options
 */
export function displayCodeStats(lineStats, languageStats, options = {}) {
  displaySection("CODE STATISTICS", "📊", options);

  console.log(
    chalk.white(
      `Total Lines of Code: ${chalk.cyan(lineStats.totalLOC.toLocaleString())}`
    )
  );

  if (languageStats && languageStats.languages.length > 0) {
    console.log(chalk.white("\nTop Languages:"));
    languageStats.languages.slice(0, 5).forEach(({ language, count }) => {
      const percentage = ((count / languageStats.totalFiles) * 100).toFixed(1);
      console.log(
        chalk.white(
          `  ${language.padEnd(20)} ${chalk.cyan(
            count + " files"
          )} (${percentage}%)`
        )
      );
    });
  }

  if (lineStats.largestFiles.length > 0) {
    console.log(chalk.white("\nLargest Files:"));
    lineStats.largestFiles.slice(0, 5).forEach(({ file, lines }) => {
      console.log(
        chalk.white(
          `  ${file.padEnd(40)} ${chalk.cyan(
            lines.toLocaleString() + " lines"
          )}`
        )
      );
    });
  }
}

/**
 * Display commit frequency analysis
 * @param {Object} frequencyStats - Frequency statistics
 * @param {Object} options - Display options
 */
export function displayCommitFrequency(frequencyStats, options = {}) {
  displaySection("COMMIT FREQUENCY ANALYSIS", "📈", options);

  console.log(
    chalk.white(
      `Most Active Day:   ${chalk.cyan(frequencyStats.maxDay.date)} (${
        frequencyStats.maxDay.count
      } commits)`
    )
  );
  console.log(
    chalk.white(
      `Most Active Month: ${chalk.cyan(frequencyStats.maxMonth.date)} (${
        frequencyStats.maxMonth.count
      } commits)`
    )
  );
  console.log(
    chalk.white(
      `Most Active Year:  ${chalk.cyan(frequencyStats.maxYear.date)} (${
        frequencyStats.maxYear.count
      } commits)`
    )
  );
  console.log(
    chalk.white(
      `Avg Commits/Month: ${chalk.cyan(frequencyStats.avgCommitsPerMonth)}`
    )
  );
  console.log(
    chalk.white(
      `Avg Commits/Day:   ${chalk.cyan(frequencyStats.avgCommitsPerDay)}`
    )
  );
}

/**
 * Display time-based analysis
 * @param {Object} timeStats - Time-based statistics
 * @param {Object} options - Display options
 */
export function displayTimeAnalysis(timeStats, options = {}) {
  displaySection("TIME-BASED ANALYSIS", "⏰", options);

  console.log(
    chalk.white(
      `Most Active Hour: ${chalk.cyan(
        timeStats.mostActiveHour.hour + ":00"
      )} (${timeStats.mostActiveHour.count} commits)`
    )
  );

  if (timeStats.timeBlocks) {
    console.log(chalk.white("\nCommits by Time of Day:"));
    Object.entries(timeStats.timeBlocks).forEach(([block, count]) => {
      const bar = "█".repeat(Math.max(1, Math.floor(count / 5)));
      console.log(
        chalk.white(`  ${block.padEnd(30)} ${chalk.cyan(bar)} ${count}`)
      );
    });
  }

  if (timeStats.weekendVsWeekday) {
    console.log(chalk.white("\nWeekend vs Weekday:"));
    console.log(
      chalk.white(
        `  Weekday commits: ${chalk.cyan(timeStats.weekendVsWeekday.weekday)}`
      )
    );
    console.log(
      chalk.white(
        `  Weekend commits: ${chalk.cyan(timeStats.weekendVsWeekday.weekend)}`
      )
    );
    const weekendPercentage = (
      (timeStats.weekendVsWeekday.weekend /
        (timeStats.weekendVsWeekday.weekday +
          timeStats.weekendVsWeekday.weekend)) *
      100
    ).toFixed(1);
    const warriorEmoji = options.noEmoji
      ? ""
      : weekendPercentage > 30
      ? " 💪"
      : "";
    console.log(
      chalk.white(
        `  Weekend warrior: ${chalk.cyan(
          weekendPercentage + "%"
        )}${warriorEmoji}`
      )
    );
  }

  console.log(chalk.white("\nCommits by Day of Week:"));
  Object.entries(timeStats.weekdayCommits)
    .sort(([, a], [, b]) => b - a)
    .forEach(([day, count]) => {
      const bar = "█".repeat(Math.max(1, Math.floor(count / 3)));
      console.log(
        chalk.white(`  ${day.padEnd(10)} ${chalk.cyan(bar)} ${count}`)
      );
    });
}

/**
 * Display streak statistics
 * @param {Object} streakStats - Streak statistics
 * @param {Object} options - Display options
 */
export function displayStreakStats(streakStats, options = {}) {
  displaySection("COMMIT STREAK ANALYSIS", "🔥", options);

  const fireEmoji = options.noEmoji ? "" : "🔥 ";
  console.log(
    chalk.white(
      `${fireEmoji}Current Streak:  ${chalk.cyan(
        streakStats.currentStreak + " days"
      )}`
    )
  );

  const trophyEmoji = options.noEmoji ? "" : "🏆 ";
  console.log(
    chalk.white(
      `${trophyEmoji}Longest Streak:  ${chalk.cyan(
        streakStats.longestStreak + " days"
      )}`
    )
  );

  if (streakStats.longestStreakStart && streakStats.longestStreakEnd) {
    console.log(
      chalk.gray(
        `   (${streakStats.longestStreakStart} to ${streakStats.longestStreakEnd})`
      )
    );
  }

  const calendarEmoji = options.noEmoji ? "" : "📅 ";
  console.log(
    chalk.white(
      `${calendarEmoji}Total Active Days: ${chalk.cyan(
        streakStats.totalActiveDays
      )}`
    )
  );

  if (streakStats.streakMilestones && streakStats.streakMilestones.length > 0) {
    console.log(chalk.white("\nStreak Achievements:"));
    streakStats.streakMilestones.forEach((milestone) => {
      console.log(chalk.yellow(`  ${milestone}`));
    });
  }
}

/**
 * Display commit size statistics
 * @param {Object} sizeStats - Size statistics
 * @param {Object} options - Display options
 */
export function displayCommitSizeStats(sizeStats, options = {}) {
  displaySection("COMMIT SIZE STATISTICS", "📏", options);

  console.log(
    chalk.white(
      `Avg files changed per commit: ${chalk.cyan(sizeStats.avgFilesChanged)}`
    )
  );
  console.log(
    chalk.white(
      `Avg insertions per commit:    ${chalk.green(
        "+" + sizeStats.avgInsertions
      )}`
    )
  );
  console.log(
    chalk.white(
      `Avg deletions per commit:     ${chalk.red("-" + sizeStats.avgDeletions)}`
    )
  );
}

/**
 * Display file churn statistics
 * @param {Array} fileChurn - File churn statistics
 * @param {Object} options - Display options
 */
export function displayFileChurn(fileChurn, options = {}) {
  if (!fileChurn || fileChurn.length === 0) return;

  displaySection("MOST CHANGED FILES", "🔄", options);

  fileChurn.slice(0, 10).forEach(({ file, changes }) => {
    console.log(
      chalk.white(`  ${file.padEnd(45)} ${chalk.cyan(changes + " changes")}`)
    );
  });
}

/**
 * Display fun facts and achievements
 * @param {Object} allStats - All statistics for generating fun facts
 * @param {Object} options - Display options
 */
export function displayFunFacts(allStats, options = {}) {
  displaySection("FUN FACTS & ACHIEVEMENTS", "🎉", options);

  const facts = [];

  // First commit of the year
  if (allStats.basicStats.firstCommitDate) {
    const firstDate = new Date(allStats.basicStats.firstCommitDate);
    if (firstDate.getFullYear() === options.year) {
      facts.push(
        `${options.noEmoji ? "★" : "🎊"} First commit of ${options.year}!`
      );
    }
  }

  // Most productive contributor
  if (allStats.contributors && allStats.contributors.length > 0) {
    const top = allStats.contributors[0];
    facts.push(
      `${options.noEmoji ? "★" : "🏆"} MVP: ${top.name} with ${
        top.commits
      } commits`
    );
  }

  // Code size achievement
  if (allStats.lineStats && allStats.lineStats.totalLOC > 10000) {
    facts.push(
      `${options.noEmoji ? "★" : "💻"} Over ${(
        allStats.lineStats.totalLOC / 1000
      ).toFixed(0)}K lines of code!`
    );
  }

  // Night owl
  if (allStats.timeStats && allStats.timeStats.timeBlocks) {
    const lateNight =
      allStats.timeStats.timeBlocks["Late Night (00:00-03:59)"] || 0;
    const totalCommits = allStats.basicStats.numCommits || 1;
    if (lateNight / totalCommits > 0.2) {
      facts.push(
        `${options.noEmoji ? "★" : "🦉"} Night owl - ${(
          (lateNight / totalCommits) *
          100
        ).toFixed(0)}% commits after midnight`
      );
    }
  }

  // Early bird
  if (allStats.timeStats && allStats.timeStats.timeBlocks) {
    const earlyMorning =
      allStats.timeStats.timeBlocks["Early Morning (04:00-07:59)"] || 0;
    const totalCommits = allStats.basicStats.numCommits || 1;
    if (earlyMorning / totalCommits > 0.15) {
      facts.push(
        `${options.noEmoji ? "★" : "🌅"} Early bird - ${(
          (earlyMorning / totalCommits) *
          100
        ).toFixed(0)}% commits before 8 AM`
      );
    }
  }

  facts.forEach((fact) => {
    console.log(chalk.yellow(`  ${fact}`));
  });
}

/**
 * Create a loading spinner
 * @param {string} text - Loading text
 * @returns {Object} - Ora spinner instance
 */
export function createSpinner(text) {
  return ora({
    text,
    spinner: "dots",
  });
}

/**
 * Display footer
 */
export function displayFooter() {
  console.log();
  console.log(chalk.gray("═".repeat(60)));
  console.log(chalk.cyan.bold("Thank you for using Git Wrapped!".padStart(40)));
  console.log(chalk.gray("Made with ❤️  for developers".padStart(42)));
  console.log();
}
