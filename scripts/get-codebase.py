#Write me a python file that will read my code files I specify and write to a local text file all the code with the filename identified

import os
# Specify the directory containing the code files
directory = 'D:/projects/project_search/'

files = [

     'backend/app.py',
 
    'frontend/src/components/ui/button.tsx',
    'frontend/src/components/ui/card.tsx',
    'frontend/src/components/ui/dialog.tsx',
    'frontend/src/components/ui/input.tsx',
    'frontend/src/components/ProjectSearch.tsx',
    'frontend/src/App.tsx',
    'frontend/src/App.css',
    'frontend/src/index.css',
    'frontend/src/lib/utils.ts',
    'frontend/tsconfig.app.json',
    'frontend/tsconfig.json',
    'frontend/tailwind.config.js',
    'frontend/tsconfig.node.json',
    'frontend/vite.config.ts',

     #'front-end/src/components/EmployeeMatching/ActionButtons.js',
    #'front-end/src/components/EmployeeMatching/EnhancedResumes.js',
    #'front-end/src/components/EmployeeMatching/ResumeViewer.js',
    #'front-end/src/components/EmployeeMatching/SearchControls.js',
    #'front-end/src/components/EmployeeMatching/ResultsTable.js',
]

# Specify the output file path
output_file = 'D:/temp/tmp_codebase/codebase.txt'

# Open the output file in write mode
with open(output_file, 'w') as f:
    # Iterate over all files in the directory
    for filename in files:
        # Open the file in read mode
        with open(os.path.join(directory, filename), 'r') as code_file:
            # Write the filename to the output file
            f.write(f"<File: {filename}>\n")
            # Write the code from the file to the output file
            f.write(code_file.read())
            # Add a separator between files
            f.write('\n' + '-'*80 + '\n')