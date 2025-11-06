# Dharmasikhara Assessment Plan

## Overview
This repository contains the implementation framework for the Dharmasikhara Legal Competency Assessment system. The system evaluates legal professionals' competencies through scenario-based assessments with multiple question types and comprehensive scoring mechanisms.

## Files Structure
- `assessment_framework.py` - Core Python implementation of the assessment system
- `assessment_config.json` - Configuration file defining assessment structure and rules
- `theft_scenario_assessment.json` - Sample assessment for a theft/bail application scenario
- `README.md` - This documentation file

## Assessment Framework Features

### 1. Trigger Mechanism
- **Primary Trigger**: Activates upon completion of courtroom scenario
- **Secondary Trigger**: Activates when user exits after 70% completion
- **Mandatory Requirement**: Must be completed before accessing next scenario

### 2. Assessment Structure
The assessment is divided into four sections:

1. **Legal Knowledge & Procedure** (20% weightage)
   - 10 Single-Select MCQs
   - 10 minutes time limit

2. **Case Analysis & Reasoning** (30% weightage)
   - 6 Scenario-based questions
   - 15 minutes time limit

3. **Ethical Judgment** (25% weightage)
   - 5 Situational judgment questions
   - 10 minutes time limit

4. **Argument Quality Review** (25% weightage)
   - 2 Open-ended questions
   - 10 minutes time limit

### 3. Question Types
- **Single-Select MCQs**: Test procedural knowledge
- **Multi-Select MCQs**: Assess nuanced understanding
- **Case-Based Reasoning**: Evaluate evidence interpretation
- **Situational Judgment Tests**: Measure ethical decision-making
- **Argument Deconstruction**: Assess critical analysis skills
- **Open-Ended Justification**: Capture strategic reasoning

### 4. Scoring & Grading
- **Total Points**: 100
- **Pass Threshold**: 70% (Grade B minimum)
- **Performance Tiers**:
  - A+ (90-100): Exemplary Advocate
  - A (80-89): Proficient Advocate
  - B (70-79): Competent Advocate
  - C (60-69): Developing Advocate
  - F (<60): Needs Improvement

### 5. Excellence Bonuses
- Perfect score in Ethics section: "Guardian of Justice" badge
- 95%+ in Case Analysis: "Analytical Mind" recognition
- Complete assessment in <35 minutes with 85%+: "Efficient Counsel" achievement

## Implementation Details

### Python Framework
The `assessment_framework.py` file implements:
- Assessment trigger management
- Cooldown period handling
- Timer functionality
- Scoring engine with rubric-based evaluation
- Performance tier determination
- Badge awarding system

### Configuration
The `assessment_config.json` file defines:
- Assessment structure and timing
- Question type specifications
- Scoring methodology
- Performance tracking mechanisms
- Certification and badging pathways

### Sample Assessment
The `theft_scenario_assessment.json` file provides:
- Complete assessment for a theft/bail scenario
- All question types with correct answers
- Competency tagging for each question
- Detailed scoring rubrics

## Usage

To use the assessment framework:

1. Import the framework:
```python
from assessment_framework import AssessmentFramework, Assessment
```

2. Create an assessment instance from JSON configuration

3. Activate assessment based on triggers

4. Start assessment after cooldown period

5. Submit responses for each question

6. Complete assessment to generate detailed report

## Contributing
This framework is designed to be extensible for additional legal scenarios and question types. Contributions to expand the question bank or add new assessment features are welcome.

## License
This assessment framework is proprietary to Dharmasikhara and intended for internal use only.