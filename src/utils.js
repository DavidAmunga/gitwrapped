import { execSync } from "child_process";
import chalk from "chalk";

/**
 * Execute a git command and return the result
 * @param {string} command - The command to execute
 * @param {boolean} verbose - Whether to log debug information
 * @returns {string|null} - The command output or null on error
 */
export function execCommand(command, verbose = false) {
  try {
    const result = execSync(command, { shell: "/bin/sh" }).toString().trim();
    if (verbose) {
      console.log(chalk.blue(`Command: ${command}`));
      console.log(chalk.blue(`Output: ${result}`));
    }
    if (!result) throw new Error("No output returned.");
    return result;
  } catch (error) {
    if (verbose) {
      console.error(chalk.red(`Error executing command: ${command}`));
      console.error(chalk.red(`Error message: ${error.message}`));
    }
    return null;
  }
}

/**
 * Format a date string into a readable format
 * @param {string} dateStr - The date string to format
 * @returns {string} - The formatted date
 */
export function formatDate(dateStr) {
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

/**
 * Format a duration between two dates
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @returns {string} - The formatted duration
 */
export function formatDuration(startDate, endDate) {
  const totalMillis = endDate - startDate;

  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  const years = Math.floor(totalMillis / year);
  const months = Math.floor((totalMillis % year) / month);
  const weeks = Math.floor((totalMillis % month) / week);
  const days = Math.floor((totalMillis % week) / day);
  const hours = Math.floor((totalMillis % day) / hour);
  const minutes = Math.floor((totalMillis % hour) / minute);
  const seconds = Math.floor((totalMillis % minute) / second);

  const parts = [];
  if (years) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (weeks) parts.push(`${weeks} week${weeks > 1 ? "s" : ""}`);
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  if (seconds) parts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);

  return parts.join(", ") || "0 seconds";
}

/**
 * Get the repository name from the git remote URL
 * @param {boolean} verbose - Whether to log errors
 * @returns {string} - The repository name
 */
export function getRepositoryName(verbose = false) {
  const remoteUrl = execCommand("git config --get remote.origin.url", verbose);
  if (!remoteUrl) {
    if (verbose) console.error(chalk.red('No remote named "origin" found.'));
    return "unknown";
  }

  const repoNameMatch = remoteUrl.match(/\/([^\/]+?)(\.git)?$/);
  if (repoNameMatch) {
    return repoNameMatch[1];
  } else {
    if (verbose) console.error(chalk.red("Failed to parse repository name."));
    return "unknown";
  }
}

/**
 * Build git log command with optional date filtering
 * @param {Object} options - Options for date filtering
 * @param {number} options.year - Year to filter by
 * @param {string} options.since - Custom since date
 * @param {string} options.until - Custom until date
 * @returns {string} - Date filter flags for git commands
 */
export function getDateFilter(options = {}) {
  if (options.year) {
    return `--since="${options.year}-01-01" --until="${options.year}-12-31 23:59:59"`;
  } else if (options.since || options.until) {
    let filter = "";
    if (options.since) filter += `--since="${options.since}"`;
    if (options.until) filter += ` --until="${options.until}"`;
    return filter.trim();
  }
  return "";
}

/**
 * Parse command line arguments
 * @returns {Object} - Parsed options
 */
export function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes("--verbose"),
    year: null,
    allTime: args.includes("--all-time"),
    noEmoji: args.includes("--no-emoji"),
    minimal: args.includes("--minimal"),
  };

  // Parse --year flag
  const yearIndex = args.findIndex((arg) => arg === "--year");
  if (yearIndex !== -1 && args[yearIndex + 1]) {
    options.year = parseInt(args[yearIndex + 1]);
  }

  return options;
}

/**
 * Get file extension from a file path
 * @param {string} filePath - The file path
 * @returns {string} - The file extension
 */
export function getFileExtension(filePath) {
  const match = filePath.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : "";
}

/**
 * Map file extension to programming language
 * @param {string} ext - The file extension
 * @returns {string} - The programming language name
 */
export function extensionToLanguage(ext) {
  const languageMap = {
    js: "JavaScript",
    jsx: "JavaScript",
    ts: "TypeScript",
    tsx: "TypeScript",
    py: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
    h: "C/C++ Header",
    hpp: "C++ Header",
    cs: "C#",
    rb: "Ruby",
    go: "Go",
    rs: "Rust",
    php: "PHP",
    swift: "Swift",
    kt: "Kotlin",
    scala: "Scala",
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    sass: "Sass",
    less: "Less",
    vue: "Vue",
    svelte: "Svelte",
    json: "JSON",
    xml: "XML",
    yaml: "YAML",
    yml: "YAML",
    md: "Markdown",
    sql: "SQL",
    sh: "Shell",
    bash: "Bash",
    zsh: "Zsh",
    fish: "Fish",
    r: "R",
    m: "Objective-C",
    mm: "Objective-C++",
    dart: "Dart",
    lua: "Lua",
    pl: "Perl",
    ex: "Elixir",
    exs: "Elixir",
    erl: "Erlang",
    clj: "Clojure",
    elm: "Elm",
    hs: "Haskell",
    ml: "OCaml",
    vb: "Visual Basic",
  };

  return languageMap[ext] || ext.toUpperCase();
}
