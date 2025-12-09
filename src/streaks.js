import { execCommand, getDateFilter } from "./utils.js";

/**
 * Get commit streak statistics
 * @param {Object} options - Filter options (year, since, until)
 * @param {boolean} verbose - Whether to log debug info
 * @returns {Object} - Streak statistics
 */
export function getStreakStats(options = {}, verbose = false) {
  const dateFilter = getDateFilter(options);
  const branchFilter = options.allBranches ? '--all' : '';
  const output = execCommand(
    `git log --format="%ai" ${branchFilter} ${dateFilter} | cut -d' ' -f1 | sort -u`,
    verbose
  );

  if (!output) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      longestStreakStart: null,
      longestStreakEnd: null,
      totalActiveDays: 0,
      streakMilestones: [],
    };
  }

  const commitDates = output
    .split("\n")
    .filter((d) => d.trim())
    .map((d) => new Date(d))
    .sort((a, b) => a - b);

  if (commitDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      longestStreakStart: null,
      longestStreakEnd: null,
      totalActiveDays: 0,
      streakMilestones: [],
    };
  }

  const totalActiveDays = commitDates.length;

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from the most recent commit
  const lastCommitDate = new Date(commitDates[commitDates.length - 1]);
  lastCommitDate.setHours(0, 0, 0, 0);

  // Check if there's a commit today or yesterday
  const daysSinceLastCommit = Math.floor(
    (today - lastCommitDate) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastCommit <= 1) {
    // Count backwards from the most recent commit
    currentStreak = 1;
    let checkDate = new Date(lastCommitDate);

    for (let i = commitDates.length - 2; i >= 0; i--) {
      const prevDate = new Date(commitDates[i]);
      prevDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (checkDate - prevDate) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        currentStreak++;
        checkDate = prevDate;
      } else if (daysDiff > 1) {
        break;
      }
      // If daysDiff === 0, it's the same day, continue to next commit
    }
  }

  // Calculate longest streak
  let longestStreak = 1;
  let longestStreakStart = commitDates[0];
  let longestStreakEnd = commitDates[0];
  let tempStreak = 1;
  let tempStreakStart = commitDates[0];

  for (let i = 1; i < commitDates.length; i++) {
    const prevDate = new Date(commitDates[i - 1]);
    const currDate = new Date(commitDates[i]);

    prevDate.setHours(0, 0, 0, 0);
    currDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      tempStreak++;
    } else if (daysDiff === 0) {
      // Same day, don't increment streak
      continue;
    } else {
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
        longestStreakStart = tempStreakStart;
        longestStreakEnd = commitDates[i - 1];
      }
      tempStreak = 1;
      tempStreakStart = currDate;
    }
  }

  // Check one last time after the loop
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
    longestStreakStart = tempStreakStart;
    longestStreakEnd = commitDates[commitDates.length - 1];
  }

  // Determine streak milestones
  const streakMilestones = [];
  if (longestStreak >= 7) streakMilestones.push("Week Warrior");
  if (longestStreak >= 30) streakMilestones.push("Month Master");
  if (longestStreak >= 100) streakMilestones.push("Century Club");
  if (longestStreak >= 365) streakMilestones.push("Year Legend");

  return {
    currentStreak,
    longestStreak,
    longestStreakStart: longestStreakStart.toISOString().split("T")[0],
    longestStreakEnd: longestStreakEnd.toISOString().split("T")[0],
    totalActiveDays,
    streakMilestones,
  };
}

/**
 * Generate a visual calendar heatmap for commits
 * @param {Object} options - Filter options (year, since, until)
 * @param {boolean} verbose - Whether to log debug info
 * @returns {string} - ASCII calendar visualization
 */
export function generateStreakCalendar(options = {}, verbose = false) {
  const dateFilter = getDateFilter(options);
  const branchFilter = options.allBranches ? '--all' : '';
  const output = execCommand(
    `git log --format="%ai" ${branchFilter} ${dateFilter} | cut -d' ' -f1`,
    verbose
  );

  if (!output) return "";

  const commitsByDate = {};
  output
    .split("\n")
    .filter((d) => d.trim())
    .forEach((date) => {
      commitsByDate[date] = (commitsByDate[date] || 0) + 1;
    });

  // Get date range
  const dates = Object.keys(commitsByDate).sort();
  if (dates.length === 0) return "";

  const startDate = new Date(dates[0]);
  const endDate = new Date(dates[dates.length - 1]);

  // Create a simple visualization (last 12 weeks)
  const weeksToShow = 12;
  const today = new Date();
  const calendar = [];

  for (let week = weeksToShow - 1; week >= 0; week--) {
    const weekRow = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (week * 7 + (6 - day)));
      const dateStr = date.toISOString().split("T")[0];

      const commits = commitsByDate[dateStr] || 0;
      let symbol = "·";
      if (commits > 0 && commits <= 2) symbol = "▪";
      else if (commits > 2 && commits <= 5) symbol = "▪";
      else if (commits > 5) symbol = "█";

      weekRow.push(symbol);
    }
    calendar.push(weekRow.join(" "));
  }

  return calendar.join("\n");
}
