import sys

def update_pubspec(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()

    out = []
    for line in lines:
        if line.strip() == '# assets:':
            out.append('  assets:\n')
        elif line.strip() == '#   - images/a_dot_burr.jpeg':
            out.append('    - assets/images/\n')
        elif line.strip() == '#   - images/a_dot_ham.jpeg':
            pass
        else:
            out.append(line)

    with open(file_path, 'w') as f:
        f.writelines(out)

if __name__ == '__main__':
    update_pubspec('rtc_user_app/pubspec.yaml')
    update_pubspec('rtc_admin_app/pubspec.yaml')
