from itertools import combinations
from collections import defaultdict

data = [
    ['SQL', 'JavaScript', 'Кроссбраузерное тестирование', 'Sanity-тестирование', 'Рефакторинг кода', 'Yii', 'Системная интеграция', 'PHP', '.NET Framework', 'Английский\xa0— B2 — Средне-продвинутый'],
    ['SQL', 'Java', 'Работа с базами данных', 'JavaScript'],
    ['Английский язык', 'C/C++'],
    ['STL', 'Linux', 'C++'],
    ['C++', 'SQL', 'C/C++', 'Linux', 'Python', 'Qt', 'PostgreSQL', 'TCP/IP', 'ГОСТ', 'PL/pgSQL'],
    ['Linux', 'C++', 'Qt'],
    ['Golang', 'gRPC', 'HTTP', 'C/C++', 'Математическое моделирование'],
    ['HTML', 'CSS', 'PHP', 'JavaScript', 'Python', 'SQL'],
    ['C++'],
    ['C++', 'Qt', 'Протокол Modbus', 'Linux'],
    ['C++', 'Qt', 'SVN', 'Linux', 'PostgreSQL']
]

# Normalize skills (e.g., treat 'C++' and 'C/C++' as the same if they appear together)
def normalize_skills(skills):
    normalized = []
    cpp_variants = {'C++', 'C/C++'}
    has_cpp = any(s in cpp_variants for s in skills)
    for s in skills:
        if s in cpp_variants and has_cpp:
            normalized.append('C++')  # standardize to 'C++'
        else:
            normalized.append(s)
    return list(set(normalized))  # remove duplicates

# Generate all combinations of 2, 3, and 4 skills
skill_counts = defaultdict(int)

for row in data:
    row_skills = normalize_skills(row)
    for r in range(2, 5):  # combinations of 2, 3, 4
        for combo in combinations(sorted(row_skills), r):
            skill_counts[combo] += 1

# Sort by frequency in descending order
sorted_combinations = sorted(skill_counts.items(), key=lambda x: -x[1])

# Return the top results
top_combinations = sorted_combinations[:10]  # adjust as needed

print("Top Skill Pairings:")
for combo, count in top_combinations:
    print(f"{combo}: {count}")