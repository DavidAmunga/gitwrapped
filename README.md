# gitwrapped

Your repository's stats - a beautiful CLI tool to visualize your Git statistics!

<div align="center">

[![npm version](https://img.shields.io/npm/v/gitwrapped.svg)](https://www.npmjs.com/package/gitwrapped)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Git Wrapped Screenshot](screenshots/product.png)

</div>

## Features

### Comprehensive Statistics

- **Repository Overview**

  - Total commits, branches, pull requests, and contributors
  - Repository age and activity timeline
  - First and last commit dates with duration

- **Branch Analytics**

  - Total branch count
  - Most active branches with commit counts
  - Last commit author per branch
  - Comprehensive branch activity overview

- **Contributor Insights**

  - Top contributors with commit counts

- **Code Analysis**

  - Total lines of code across your repository
  - Programming language breakdown (top 5 languages)
  - Largest files by line count
  - Most frequently changed files (file churn)

- **Time-Based Analytics**

  - Most active hour, day, month, and year
  - Commits by time of day (4-hour blocks)
  - Weekend warrior stats (weekend vs weekday commits)
  - Commits by day of week with visual bars

- **Commit Streaks**

  - Current streak tracking
  - Longest streak ever with dates
  - Total active days
  - Streak achievements (Week Warrior, Month Master, Century Club, Year Legend)

- **Commit Patterns**

  - Average commit size (files changed, insertions, deletions)
  - Commit frequency analysis
  - Average commits per day and month

- **Fun Facts & Achievements**
  - MVP contributor
  - Night owl detection (commits after midnight)
  - Early bird detection (commits before 8 AM)
  - Code size milestones
  - And more surprises!

### 🔧 Flexible Options

- **Year filtering**: Focus on a specific year (e.g., `--year 2025`)
- **All branches** (default): Analyzes all branches by default; use `--current-branch-only` to analyze only the current branch
- **Branch statistics**: View detailed branch analytics including most active branches
- **Minimal mode**: Condensed output for quick overview
- **No emoji mode**: Clean output without emojis (default)
- **Verbose mode**: Debug information for troubleshooting

## Installation

### Global Installation (Recommended)

```bash
npm install -g gitwrapped
```

### Run Without Installing

```bash
npx gitwrapped
```

### Local Development

```bash
npm link
```

## Usage

### Basic Usage

Navigate to any Git repository and run:

```bash
gitwrapped
```

### Advanced Usage

```bash
# Filter by specific year (analyzes all branches by default)
gitwrapped --year 2025

# Show all-time statistics (default)
gitwrapped --all-time

# Analyze only the current branch
gitwrapped --current-branch-only

# Minimal output (condensed view)
gitwrapped --minimal

# Disable emojis
gitwrapped --no-emoji

# Combine options
gitwrapped --year 2024 --minimal

# Debug mode
gitwrapped --verbose

# Show help
gitwrapped --help
```

## Examples

### Example 1: Your Personal Blog

```bash
cd ~/projects/my-blog
gitwrapped --year 2025
```

Output includes your 2025 coding activity, streaks, most active times, and achievements!

### Example 2: Team Project

```bash
cd ~/work/team-project
gitwrapped
```

See the full history with all contributors, commit patterns, and code statistics.

### Example 3: Quick Check

```bash
cd ~/projects/side-project
gitwrapped --minimal
```

Get a quick overview without all the details.

## Sample Output

See the beautiful output in action! Git Wrapped provides a comprehensive, color-coded visualization of your repository statistics:

![Git Wrapped Output](screenshots/product.png)

The output includes:

- Stunning ASCII art banner with gradient colors
- Repository overview with key metrics
- Timeline of your project's history
- Contributor leaderboard
- Code statistics and language breakdown
- Commit frequency analysis
- Time-based insights (most active hours, days)
- Commit streaks and achievements
- Fun facts about your coding patterns

## Requirements

- Node.js 14.x or higher
- Git repository with at least one commit
- Unix-based system (macOS, Linux) or Windows with Git Bash

## Dependencies

Git Wrapped uses these awesome packages:

- `chalk` - Terminal styling
- `boxen` - Beautiful boxes
- `gradient-string` - Gradient colors
- `ora` - Elegant spinners
- `cli-progress` - Progress bars
- `asciichart` - ASCII charts
- `commander` - CLI framework

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [David Amunga](https://github.com/DavidAmunga)

## Show Your Support

If you like this project, please give it a ⭐️ on [GitHub](https://github.com/DavidAmunga/gitwrapped)!

## Links

- [npm Package](https://www.npmjs.com/package/gitwrapped)
- [GitHub Repository](https://github.com/DavidAmunga/gitwrapped)
- [Report Issues](https://github.com/DavidAmunga/gitwrapped/issues)

## Inspired By

Spotify Wrapped - but for your code! 🎵 → 💻

---

Made with ❤️ by developers, for developers.
