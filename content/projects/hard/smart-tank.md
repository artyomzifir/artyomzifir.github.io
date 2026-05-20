---
id: smart-tank
order: 7
mode: hard
github: "https://github.com/IU-Capstone-Project-2025/ProjectFly"
link: "https://t.me/universityinnopolis/2689"
tags: ["STM32", "Embedded C", "Reed Switch", "UAV", "Sensors", "Prototyping"]
name_en: "ProjectFly — Smart Tank for Agricultural UAVs"
name_ru: "ProjectFly — Умный бак для агро-БАС"
meta_en: "2025 · Hardware Engineer / Test Engineer"
meta_ru: "2025 · Hardware Engineer / Test Engineer"
stack_en: "Embedded C · STM32 · Reed switches · CAD"
stack_ru: "Embedded C · STM32 · Геркон · CAD"
problem_en: "Agricultural UAVs waste fertilizers due to imprecise dosing — no reliable real-time fill level monitoring in harsh vibration conditions."
problem_ru: "Агродроны расходуют удобрения из-за неточного дозирования — нет надёжного мониторинга уровня в условиях вибрации."
solution_en: "Reed switch-based sensor with magnetic float, STM32 controller, sliding window median filter for vibration robustness."
solution_ru: "Датчик на герконе с магнитным поплавком, STM32, скользящий медианный фильтр для виброустойчивости."
result_en: "Prototype validated in lab conditions. No calibration required, liquid-type independent. Covered in university press."
result_ru: "Прототип валидирован в лабораторных условиях. Не требует калибровки, не зависит от типа жидкости. Освещён в пресс-службе."
---

## en

### bullets
- Evaluated measurement principles: reed switch vs. capacitive vs. float — proposed reed switch for reliability and simplicity
- Designed test rigs and validation procedures for sensor configurations
- Validated median filter approach for stable signal under UAV vibration conditions
- Hardware stack: Reed Switches 4×28mm NC, STM32F103C8T6, UART, 3.3–5V
- Federal program "Kadryi dlya BAS" — 76 teams from 16 regions of Russia

## ru

### bullets
- Оценил принципы измерения: геркон vs. ёмкостной vs. поплавковый — предложил геркон за надёжность и простоту
- Разработал стенды и процедуры валидации конфигураций датчика
- Подтвердил эффективность медианного фильтра для стабильного сигнала при вибрации БАС
- Стек: Геркон 4×28мм NC, STM32F103C8T6, UART, 3.3–5В
- Федеральная программа «Кадры для БАС» — 76 команд из 16 регионов России
