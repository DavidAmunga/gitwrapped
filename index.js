#!/usr/bin/env node
import { execSync } from "child_process";
import chalk from "chalk";

function execCommand(command) {
  const verbose = process.argv.includes("--verbose");

  try {
    const result = execSync(command, { shell: "/bin/sh" }).toString().trim();
    if (verbose) {
      console.log(chalk.blue(`Command: ${command}`)); // Debug: log command
      console.log(chalk.blue(`Output: ${result}`)); // Debug: log raw output
    }
    if (!result) throw new Error("No output returned.");
    return result;
  } catch (error) {
    console.error(chalk.red(`Error executing command: ${command}`));
    console.error(chalk.red(`Error message: ${error.message}`));
    return null;
  }
}

function getRepositoryName() {
  const remoteUrl = execCommand("git config --get remote.origin.url");
  if (!remoteUrl) {
    console.error(chalk.red('No remote named "origin" found.'));
    return "unknown"; // Return a default or indicate unknown.
  }

  // This regular expression is designed to capture the repository name
  // from typical Git URLs (both SSH and HTTPS formats).
  const repoNameMatch = remoteUrl.match(/\/([^\/]+?)(\.git)?$/);
  if (repoNameMatch) {
    return repoNameMatch[1]; // The repository name without .git
  } else {
    console.error(chalk.red("Failed to parse repository name."));
    return "unknown"; // Return a default or indicate unknown.
  }
}
// Function to format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(startDate, endDate) {
  // Calculate the total difference in milliseconds
  const totalMillis = endDate - startDate;

  // Define the lengths of time units in milliseconds
  // Define the lengths of time units in milliseconds
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30; // Approximation of a month
  const year = day * 365; // Approximation of a year

  // Calculate the time components
  const years = Math.floor(totalMillis / year);
  const months = Math.floor((totalMillis % year) / month);
  const weeks = Math.floor((totalMillis % month) / week);
  const days = Math.floor((totalMillis % week) / day);
  const hours = Math.floor((totalMillis % day) / hour);
  const minutes = Math.floor((totalMillis % hour) / minute);
  const seconds = Math.floor((totalMillis % minute) / second);

  // Create an array of formatted time components that are non-zero
  const parts = [];
  if (years) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (weeks) parts.push(`${weeks} week${weeks > 1 ? "s" : ""}`);
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  if (seconds) parts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);

  // Format the output by joining the parts with commas
  return parts.join(", ");
}

function getCommitDetails(commitHash) {
  // Ensure that commitHash does not contain invalid characters or multiple hashes
  if (commitHash.includes("\n")) commitHash = commitHash.split("\n")[0]; // Take only the first hash if there are multiple
  const command = `git show -s --format="%ci %h %an" ${commitHash}`;
  const output = execCommand(command);
  if (!output) {
    console.error(
      chalk.red("Failed to get commit details for hash: " + commitHash)
    );
    return null;
  }
  return output;
}

function getLineStats() {
  // Get total LOC across all files
  const totalLOC = execCommand(
    "git ls-files | xargs wc -l 2>/dev/null | tail -n 1 | awk '{print $1}'"
  );

  // Get LOC for each file and sort to find the largest
  const fileStats = execCommand("git ls-files | xargs wc -l 2>/dev/null")
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const match = line.trim().match(/(\d+)\s+(.+)/);
      if (match) {
        return {
          lines: parseInt(match[1]),
          file: match[2],
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => b.lines - a.lines);

  // Get top 10 largest files
  const largestFiles = fileStats.slice(0, 10);

  return { totalLOC, largestFiles };
}

function getContributorStats() {
  // Get detailed contributor statistics
  const contributorStats = execCommand("git shortlog -sn --all")
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const [commits, name] = line.trim().split("\t");
      return { name, commits: parseInt(commits) };
    });

  return contributorStats;
}
function getTimeBasedStats() {
  const commitTimes = execCommand('git log --format="%H|%ai"')
    .split("\n")
    .map((line) => {
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

  return { mostActiveHour, weekdayCommits };
}

function getCommitFrequencyStats() {
  // Get commits by date
  const commitDates = execCommand('git log --format="%ai"').split("\n");

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

  // Find max values
  const maxDay = Object.entries(dayStats).reduce(
    (max, [date, count]) =>
      count > max.count ? { date: formatDate(date), count } : max,
    { date: "", count: 0 }
  );

  const maxMonth = Object.entries(monthStats).reduce(
    (max, [date, count]) => {
      // Add day to make it a valid date string (using first of the month)
      const fullDate = `${date}-01`;
      return count > max.count
        ? {
            date: formatDate(fullDate).split(",")[1].trim(), // Remove day of week and only keep month, year
            count,
          }
        : max;
    },
    { date: "", count: 0 }
  );

  const maxYear = Object.entries(yearStats).reduce(
    (max, [date, count]) => {
      // Add month and day to make it a valid date string

      return count > max.count
        ? {
            date, // Only keep year
            count,
          }
        : max;
    },
    { date: "", count: 0 }
  );
  const numCommits = execCommand("git rev-list --count HEAD");

  // Calculate averages
  const totalMonths = Object.keys(monthStats).length;
  const totalDays = Object.keys(dayStats).length;
  const avgCommitsPerMonth = (parseInt(numCommits) / totalMonths).toFixed(2);
  const avgCommitsPerDay = (parseInt(numCommits) / totalDays).toFixed(2);

  return {
    maxDay,
    maxMonth,
    maxYear,
    avgCommitsPerMonth,
    avgCommitsPerDay,
  };
}

function getCommitSizeStats() {
  // Get average commit size
  const commitSizes = execCommand("git log --stat --oneline")
    .split("\n")
    .filter((line) => line.includes("files changed"))
    .map((line) => {
      const matches = line.match(
        /(\d+) files? changed(?:, (\d+) insertions?\\(\\+\\))?(?:, (\d+) deletions?\\(-\\))?/
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

function getGitWrapped() {
  // Get first commit
  const firstCommitHash = execCommand("git rev-list --max-parents=0 HEAD");
  const firstCommitDetails = getCommitDetails(firstCommitHash.trim());

  const [firstCommitDate] = firstCommitDetails.split(" ");

  // Get last commit
  const lastCommitHash = execCommand("git rev-list -n 1 HEAD");
  const lastCommitDetails = getCommitDetails(lastCommitHash.trim());
  const [lastCommitDate] = lastCommitDetails.split(" ");

  // Duration and total commits
  const startDate = new Date(firstCommitDate);
  const endDate = new Date(lastCommitDate);

  const numCommits = execCommand("git rev-list --count HEAD");
  const numBranches = execCommand("git log | git branch -a | wc -l");
  const numPullRequests = execCommand(
    'git log --oneline --grep="Merge pull request" | wc -l'
  );
  const numContributors = execCommand("git log | git shortlog -sn | wc -l");

  // Display formatted results

  console.log(
    chalk.yellow.bold.underline(
      `\n🔢 Repository History for: ${getRepositoryName()}!\n`
    )
  );
  console.log("..............................");
  console.log(chalk.white(`🔢 Total Number of Commits: ${numCommits}`));
  console.log(
    chalk.white(`📩 Total Number of Pull Requests : ${numPullRequests}`)
  );
  console.log(chalk.white(`🌿 Total Number of Branches: ${numBranches}`));
  console.log(
    chalk.white(`👥 Total Number of Contributors: ${numContributors}`)
  );

  console.log("..............................");
  console.log(chalk.green(`🚀 First Commit: ${formatDate(firstCommitDate)}`));
  console.log(chalk.yellow(`🏁 Last Commit: ${formatDate(lastCommitDate)}`));
  console.log("..............................");
  console.log(
    chalk.white(
      `⏳ Duration Between First and Last Commit: ${formatDuration(
        startDate,
        endDate
      )}`
    )
  );
  console.log("..............................");

  // Get additional statistics

  const contributorStats = getContributorStats();
  const frequencyStats = getCommitFrequencyStats();
  const timeStats = getTimeBasedStats();
  const lineStats = getLineStats();

  console.log("\n📊 Contributor Statistics:");
  console.log("..............................");
  contributorStats.forEach(({ name, commits }) => {
    console.log(chalk.white(`${name}: ${commits} commits`));
  });

  console.log("\n📊 Code Size Statistics:");
  console.log("..............................");
  console.log(
    chalk.white(`Total Lines of Code: ${lineStats.totalLOC.toLocaleString()}`)
  );

  console.log("\n📝 Largest Files by Line Count:");
  console.log("..............................");
  lineStats.largestFiles.forEach(({ file, lines }) => {
    console.log(chalk.white(`${file}: ${lines.toLocaleString()} lines`));
  });

  console.log("\n📈 Commit Frequency Analysis:");
  console.log("..............................");
  console.log(
    chalk.white(
      `Most Active Day: ${frequencyStats.maxDay.date} (${frequencyStats.maxDay.count} commits)`
    )
  );
  console.log(
    chalk.white(
      `Most Active Month: ${frequencyStats.maxMonth.date} (${frequencyStats.maxMonth.count} commits)`
    )
  );
  console.log(
    chalk.white(
      `Most Active Year: ${frequencyStats.maxYear.date} (${frequencyStats.maxYear.count} commits)`
    )
  );
  console.log(
    chalk.white(
      `Average Commits per Month: ${frequencyStats.avgCommitsPerMonth}`
    )
  );
  console.log(
    chalk.white(`Average Commits per Day: ${frequencyStats.avgCommitsPerDay}`)
  );
  console.log("..............................");
  console.log("\n⏰ Time-Based Analysis:");
  console.log("..............................");
  console.log(
    chalk.white(
      `Most Active Hour: ${timeStats.mostActiveHour.hour}:00 (${timeStats.mostActiveHour.count} commits)`
    )
  );
  console.log("\nCommits by Day of Week:");
  Object.entries(timeStats.weekdayCommits)
    .sort(([, a], [, b]) => b - a)
    .forEach(([day, count]) => {
      console.log(chalk.white(`${day}: ${count} commits`));
    });

  console.log("..............................");
}

getGitWrapped();
