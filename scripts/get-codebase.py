import argparse
from pathlib import Path
import sys
import os
import fnmatch

def parse_arguments():
    parser = argparse.ArgumentParser(description="Capture codebase files from a specified root folder.")
    parser.add_argument(
        'root',
        type=str,
        nargs='?',
        default='',
        help="Root folder to capture files from (e.g., 'backend'). If not specified, captures the entire codebase."
    )
    parser.add_argument(
        '-o', '--output',
        type=str,
        default='D:/temp/tmp_codebase/codebase.txt',
        help="Output file path. Default is 'D:/temp/tmp_codebase/codebase.txt'."
    )
    return parser.parse_args()

def main():
    args = parse_arguments()
    root = args.root.strip().rstrip('/\\')  # Remove any trailing slashes
    output_file = args.output

    # Define the base project directory
    base_project_dir = Path('D:/projects/project_search')

    if root:
        # Update base_dir to include the root folder
        base_dir = base_project_dir / root
        if not base_dir.is_dir():
            print(f"Error: The specified root folder '{root}' does not exist under '{base_project_dir}'.")
            sys.exit(1)
    else:
        base_dir = base_project_dir

    print(f"Base directory set to: {base_dir}")

    # Patterns to include (glob patterns)
    include_patterns = [
        '**/*.py',
        '**/*.tsx',
        '**/*.ts',
        '**/*.json',
        '**/*.js',
        '**/*.html',
        '**/*.css',
        '**/*.md',
        '*.md',
        'README.md',
        'example.env',  # Include example environment files
    ]

    # Patterns to exclude (glob patterns)
    exclude_patterns = [
        'package-lock.json',      # Exclude package-lock.json
        '__pycache__',            # Exclude __pycache__ directories
        'node_modules',           # Exclude node_modules directories
        '.git',                   # Exclude .git directories
        '.vscode',                # Exclude .vscode directories
        'dist',                   # Exclude dist directories
        '*.log',                  # Exclude log files
        '*.pyc',                  # Exclude compiled Python files
        '*.pyo',                  # Exclude compiled Python files
        '.env',                   # Exclude .env files
        '*.env',                  # Exclude any other .env files with different extensions
        'env',                    # Exclude env directories
        '.venv',                  # Exclude .venv directories
        'venv*',                  # Exclude virtual environment directories with variations
        '*.egg-info',             # Exclude egg-info directories
        'build',                  # Exclude build directories
        'LICENSE',
        '*.gitignore',
        'get-codebase.py'
    ]

    header = "Here is my codebase:\n\n"
    footer = "\n<end codebase> \n\n"

    print("Starting file collection...")

    # Collect files matching include patterns while excluding specified patterns
    filtered_files = []
    total_files_found = 0

    # Walk through the directory tree
    for root_path, dirs, files in os.walk(base_dir):
        current_dir = Path(root_path)

        # Determine relative path from base_dir
        try:
            relative_dir = current_dir.relative_to(base_dir)
        except ValueError:
            # If current_dir is not under base_dir, skip
            dirs[:] = []  # Don't descend further
            continue

        # Check and remove excluded directories from traversal
        dirs_to_remove = []
        for dir_name in dirs:
            for pattern in exclude_patterns:
                if fnmatch.fnmatch(dir_name, pattern):
                    dirs_to_remove.append(dir_name)
                    print(f"Excluded directory: {current_dir / dir_name}")
                    break
        for dir_name in dirs_to_remove:
            dirs.remove(dir_name)

        # Process files in the current directory
        for file_name in files:
            file_path = current_dir / file_name

            # Check if the file should be excluded
            exclude_file = False
            for pattern in exclude_patterns:
                if fnmatch.fnmatch(file_name, pattern):
                    exclude_file = True
                    print(f"Excluded file: {file_path}")
                    break
            if exclude_file:
                continue

            # Check if the file matches any of the include patterns
            include_file = False
            for include_pattern in include_patterns:
                if fnmatch.fnmatch(file_path.relative_to(base_dir).as_posix(), include_pattern):
                    include_file = True
                    break
            if include_file:
                filtered_files.append(file_path.resolve())
                total_files_found += 1
                print(f"Included file: {file_path}")

    print(f"Total files found matching include patterns: {total_files_found}")
    print(f"Total files after filtering: {len(filtered_files)}")

    if not filtered_files:
        print("No files found matching the specified criteria.")
        sys.exit(0)

    # Ensure the output directory exists
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Open the output file in write mode
    try:
        with output_path.open('w', encoding='utf-8', errors='ignore') as f:
            # Write the header
            f.write(header)

            # Iterate over all collected files
            for idx, filepath in enumerate(sorted(filtered_files), 1):
                print(f"Processing file {idx}/{len(filtered_files)}: {filepath}")
                relative_path = filepath.relative_to(base_dir).as_posix()
                # Open the file in read mode
                try:
                    with filepath.open('r', encoding='utf-8', errors='ignore') as code_file:
                        # Write the filename to the output file
                        f.write(f"<File: {relative_path}>\n")
                        # Write the code from the file to the output file
                        f.write(code_file.read())
                        # Add a separator between files
                        f.write('\n' + '-'*80 + '\n')
                except Exception as e:
                    print(f"Error reading file '{filepath}': {e}")
                    f.write(f"\nError reading file '{relative_path}': {e}\n")
                    f.write('-'*80 + '\n')

            # Write the footer
            f.write(footer)

        print(f"Codebase captured successfully in '{output_file}'.")
    except Exception as e:
        print(f"Error writing to output file '{output_file}': {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()