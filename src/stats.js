import {
  execCommand,
  formatDate,
  getDateFilter,
  getFileExtension,
  extensionToLanguage,
} from "./utils.js";

/**
 * Get commit details for a specific commit hash
 * @param {string} commitHash - The commit hash
 * @param {boolean} verbose - Whether to log debug info
 * @returns {string|null} - Commit details
 */
export function getCommitDetails(commitHash, verbose = false) {
  if (commitHash.includes("\n")) commitHash = commitHash.split("\n")[0];
  const command = `git show -s --format="%ci %h %an" ${commitHash}`;
  return execCommand(command, verbose);
}

/**
 * Get basic repository statistics
 * @param {Object} options - Filter options (year, since, until)
 * @param {boolean} verbose - Whether to log debug info
 * @returns {Object} - Repository statistics
 */
export function getBasicStats(options = {}, verbose = false) {
  const dateFilter = getDateFilter(options);

  // Get first and last commits
  const firstCommitHash = execCommand(
    `git rev-list --max-parents=0 HEAD ${dateFilter}`,
    verbose
  );
  const lastCommitHash = execCommand(
    `git rev-list -n 1 HEAD ${dateFilter}`,
    verbose
  );

  let firstCommitDate = null;
  let lastCommitDate = null;

  if (firstCommitHash) {
    const firstCommitDetails = getCommitDetails(
      firstCommitHash.trim(),
      verbose
    );
    if (firstCommitDetails) {
      firstCommitDate = firstCommitDetails.split(" ")[0];
    }
  }

  if (lastCommitHash) {
    const lastCommitDetails = getCommitDetails(lastCommitHash.trim(), verbose);
    if (lastCommitDetails) {
      lastCommitDate = lastCommitDetails.split(" ")[0];
    }
  }

  const numCommits = execCommand(
    `git rev-list --count HEAD ${dateFilter}`,
    verbose
  );

  // Fix the branches count command
  const numBranches = execCommand("git branch -a | wc -l", verbose);

  const numPullRequests = execCommand(
    `git log --oneline --grep="Merge pull request" ${dateFilter} | wc -l`,
    verbose
  );

  const numContributors = execCommand(
    `git shortlog -sn ${dateFilter} | wc -l`,
    verbose
  );

  return {
    firstCommitDate,
    lastCommitDate,
    numCommits: numCommits ? parseInt(numCommits) : 0,
    numBranches: numBranches ? parseInt(numBranches.trim()) : 0,
    numPullRequests: numPullRequests ? parseInt(numPullRequests.trim()) : 0,
    numContributors: numContributors ? parseInt(numContributors.trim()) : 0,
  };
}

/**
 * Get line statistics for the repository
 * @param {boolean} verbose - Whether to log debug info
 * @returns {Object} - Line statistics
 */
export function getLineStats(verbose = false) {
  const totalLOC = execCommand(
    "git ls-files | xargs wc -l 2>/dev/null | tail -n 1 | awk '{print $1}'",
    verbose
  );

  const fileStatsOutput = execCommand(
    "git ls-files | xargs wc -l 2>/dev/null",
    verbose
  );

  if (!fileStatsOutput) {
    return { totalLOC: 0, largestFiles: [] };
  }

  const fileStats = fileStatsOutput
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const match = line.trim().match(/(\d+)\s+(.+)/);
      if (match && match[2] !== "total") {
        return {
          lines: parseInt(match[1]),
          file: match[2],
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => b.lines - a.lines);

  const largestFiles = fileStats.slice(0, 10);

  return {
    totalLOC: totalLOC ? parseInt(totalLOC) : 0,
    largestFiles,
  };
}

/**
 * Get contributor statistics
 * @param {Object} options - Filter options (year, since, until)
 * @param {boolean} verbose - Whether to log debug info
 * @returns {Array} - Array of contributor stats
 */
export function getContributorStats(options = {}, verbose = false) {
  const dateFilter = getDateFilter(options);
  const output = execCommand(`git shortlog -sn --all ${dateFilter}`, verbose);

  if (!output) return [];

  return output
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const [commits, ...nameParts] = line.trim().split("\t");
      return { name: nameParts.join("\t"), commits: parseInt(commits) };
    });
}

/**
 * Get time-based statistics
 * @param {Object} options - Filter options (year, since, until)
 * @param {boolean} verbose - Whether to log debug info
 * @returns {Object} - Time-based statistics
 */
export function getTimeBasedStats(options = {}, verbose = false) {
  const dateFilter = getDateFilter(options);
  const output = execCommand(
    `git log --format="%H|%ai" ${dateFilter}`,
    verbose
  );

  if (!output) {
    return { mostActiveHour: { hour: 0, count: 0 }, weekdayCommits: {} };
  }

  const commitTimes = output.split("\n").map((line) => {
    const [hash, dateStr] = line.split("|");
    return new Date(dateStr);
  });

  // Group commits by hour of day
  const hourlyCommits = commitTimes.reduce((acc, date) => {
    const hour = date.getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  // Find most active hour
  const mostActiveHour = Object.entries(hourlyCommits).reduce(
    (max, [hour, count]) =>
      count > max.count ? { hour: parseInt(hour), count } : max,
    { hour: 0, count: 0 }
  );

  // Group commits by day of week
  const weekdayCommits = commitTimes.reduce((acc, date) => {
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    acc[weekday] = (acc[weekday] || 0) + 1;
    return acc;
  }, {});

  // Group commits by 4-hour time blocks
  const timeBlocks = {
    "Late Night (00:00-03:59)": 0,
    "Early Morning (04:00-07:59)": 0,
    "Morning (08:00-11:59)": 0,
    "Afternoon (12:00-15:59)": 0,
    "Evening (16:00-19:59)": 0,
    "Night (20:00-23:59)": 0,
  };

  commitTimes.forEach((date) => {
    const hour = date.getHours();
    if (hour >= 0 && hour < 4) timeBlocks["Late Night (00:00-03:59)"]++;
    else if (hour >= 4 && hour < 8) timeBlocks["Early Morning (04:00-07:59)"]++;
    else if (hour >= 8 && hour < 12) timeBlocks["Morning (08:00-11:59)"]++;
    else if (hour >= 12 && hour < 16) timeBlocks["Afternoon (12:00-15:59)"]++;
    else if (hour >= 16 && hour < 20) timeBlocks["Evening (16:00-19:59)"]++;
    else timeBlocks["Night (20:00-23:59)"]++;
  });

  // Count weekend vs weekday commits
  let weekendCommits = 0;
  let weekdayCommitCount = 0;
  commitTimes.forEach((date) => {
    const day = date.getDay();
    if (day === 0 || day === 6) weekendCommits++;
    else weekdayCommitCount++;
  });

  return {
    mostActiveHour,
    weekdayCommits,
    timeBlocks,
    weekendVsWeekday: { weekend: weekendCommits, weekday: weekdayCommitCount },
  };
}

/**
 * Get commit frequency statistics
 * @param {Object} options - Filter options (year, since, until)
 * @param {boolean} verbose - Whether to log debug info
 * @returns {Object} - Commit frequency statistics
 */
export function getCommitFrequencyStats(options = {}, verbose = false) {
  const dateFilter = getDateFilter(options);
  const output = execCommand(`git log --format="%ai" ${dateFilter}`, verbose);

  if (!output) {
    return {
      maxDay: { date: "", count: 0 },
      maxMonth: { date: "", count: 0 },
      maxYear: { date: "", count: 0 },
      avgCommitsPerMonth: 0,
      avgCommitsPerDay: 0,
    };
  }

  const commitDates = output.split("\n");

  const dayStats = {};
  const monthStats = {};
  const yearStats = {};

  commitDates.forEach((date) => {
    if (!date) return;
    const [fullDate] = date.split(" ");
    const [year, month, day] = fullDate.split("-");

    dayStats[fullDate] = (dayStats[fullDate] || 0) + 1;
    monthStats[`${year}-${month}`] = (monthStats[`${year}-${month}`] || 0) + 1;
    yearStats[year] = (yearStats[year] || 0) + 1;
  });

  const maxDay = Object.entries(dayStats).reduce(
    (max, [date, count]) =>
      count > max.count ? { date: formatDate(date), count } : max,
    { date: "", count: 0 }
  );

  const maxMonth = Object.entries(monthStats).reduce(
    (max, [date, count]) => {
      const fullDate = `${date}-01`;
      return count > max.count
        ? {
            date: formatDate(fullDate).split(",")[1].trim(),
            count,
          }
        : max;
    },
    { date: "", count: 0 }
  );

  const maxYear = Object.entries(yearStats).reduce(
    (max, [date, count]) => {
      return count > max.count ? { date, count } : max;
    },
    { date: "", count: 0 }
  );

  const numCommits = commitDates.length;
  const totalMonths = Object.keys(monthStats).length;
  const totalDays = Object.keys(dayStats).length;
  const avgCommitsPerMonth =
    totalMonths > 0 ? (numCommits / totalMonths).toFixed(2) : 0;
  const avgCommitsPerDay =
    totalDays > 0 ? (numCommits / totalDays).toFixed(2) : 0;

  return {
    maxDay,
    maxMonth,
    maxYear,
    avgCommitsPerMonth,
    avgCommitsPerDay,
  };
}

/**
 * Get commit size statistics
 * @param {Object} options - Filter options (year, since, until)
 * @param {boolean} verbose - Whether to log debug info
 * @returns {Object} - Commit size statistics
 */
export function getCommitSizeStats(options = {}, verbose = false) {
  const dateFilter = getDateFilter(options);
  const output = execCommand(`git log --stat --oneline ${dateFilter}`, verbose);

  if (!output) {
    return { avgFilesChanged: 0, avgInsertions: 0, avgDeletions: 0 };
  }

  const commitSizes = output
    .split("\n")
    .filter(
      (line) => line.includes("files changed") || line.includes("file changed")
    )
    .map((line) => {
      const matches = line.match(
        /(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/
      );
      if (matches) {
        return {
          filesChanged: parseInt(matches[1] || 0),
          insertions: parseInt(matches[2] || 0),
          deletions: parseInt(matches[3] || 0),
        };
      }
      return null;
    })
    .filter(Boolean);

  if (commitSizes.length === 0) {
    return { avgFilesChanged: 0, avgInsertions: 0, avgDeletions: 0 };
  }

  const avgFilesChanged = (
    commitSizes.reduce((sum, c) => sum + c.filesChanged, 0) / commitSizes.length
  ).toFixed(2);
  const avgInsertions = (
    commitSizes.reduce((sum, c) => sum + c.insertions, 0) / commitSizes.length
  ).toFixed(2);
  const avgDeletions = (
    commitSizes.reduce((sum, c) => sum + c.deletions, 0) / commitSizes.length
  ).toFixed(2);

  return { avgFilesChanged, avgInsertions, avgDeletions };
}

/**
 * Get programming language statistics
 * @param {boolean} verbose - Whether to log debug info
 * @returns {Object} - Language statistics
 */
export function getLanguageStats(verbose = false) {
  const filesOutput = execCommand("git ls-files", verbose);
  if (!filesOutput) return { languages: [], totalFiles: 0 };

  const files = filesOutput.split("\n");
  const languageStats = {};

  files.forEach((file) => {
    const ext = getFileExtension(file);
    if (ext) {
      const language = extensionToLanguage(ext);
      languageStats[language] = (languageStats[language] || 0) + 1;
    }
  });

  const languages = Object.entries(languageStats)
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count);

  return {
    languages,
    totalFiles: files.length,
  };
}

/**
 * Get file churn statistics (most frequently changed files)
 * @param {Object} options - Filter options (year, since, until)
 * @param {boolean} verbose - Whether to log debug info
 * @returns {Array} - File churn statistics
 */
export function getFileChurnStats(options = {}, verbose = false) {
  const dateFilter = getDateFilter(options);
  const output = execCommand(
    `git log --name-only --format="" ${dateFilter} | sort | uniq -c | sort -rn | head -20`,
    verbose
  );

  if (!output) return [];

  return output
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const match = line.trim().match(/(\d+)\s+(.+)/);
      if (match) {
        return {
          file: match[2],
          changes: parseInt(match[1]),
        };
      }
      return null;
    })
    .filter(Boolean);
}
