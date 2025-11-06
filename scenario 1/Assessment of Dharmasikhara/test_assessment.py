"""
Test script to demonstrate the Dharmasikhara Assessment Framework
"""

import json
import time
from assessment_framework import AssessmentFramework, Assessment, Section, Question, QuestionType

def load_assessment_from_json(filepath):
    """Load assessment from JSON file"""
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    assessment_data = data['assessment']
    
    # Create sections
    sections = []
    for section_data in assessment_data['sections']:
        questions = []
        for q_data in section_data['questions']:
            question = Question(
                id=q_data['id'],
                text=q_data['text'],
                type=QuestionType(q_data['type']),
                options=q_data.get('options', []),
                correct_answers=q_data.get('correct_answers', []),
                score=q_data.get('score', 1),
                competency_tags=q_data.get('competency_tags', [])
            )
            questions.append(question)
        
        section = Section(
            id=section_data['id'],
            name=section_data['name'],
            questions=questions,
            time_limit=section_data['time_limit_minutes'],
            weightage=section_data['weightage_percent']
        )
        sections.append(section)
    
    # Create assessment
    assessment = Assessment(
        id=assessment_data['id'],
        title=assessment_data['title'],
        scenario=assessment_data['scenario'],
        sections=sections,
        total_time_limit=assessment_data['total_time_limit_minutes'],
        passing_score=assessment_data['passing_score']
    )
    
    return assessment

def run_sample_assessment():
    """Run a sample assessment demonstration"""
    print("=== Dharmasikhara Assessment Framework Demo ===\n")
    
    # Initialize framework
    framework = AssessmentFramework()
    
    # Load assessment from JSON
    assessment = load_assessment_from_json('theft_scenario_assessment.json')
    print(f"Loaded assessment: {assessment.title}")
    print(f"Scenario: {assessment.scenario}")
    print(f"Total sections: {len(assessment.sections)}")
    print(f"Total questions: {sum(len(s.questions) for s in assessment.sections)}")
    print()
    
    # Activate assessment (simulating scenario completion)
    print("Activating assessment...")
    activated = framework.activate_assessment(scenario_completed=True)
    print(f"Assessment activated: {activated}")
    
    if activated:
        # Simulate cooldown period
        print(f"Cooldown period active: {framework.is_cooldown_active()} seconds remaining")
        print("Waiting for cooldown to complete...")
        
        # In a real implementation, we would wait for the actual cooldown
        # For demo purposes, we'll bypass this
        framework.cooldown.start_time = None  # Reset cooldown to simulate completion
        
        print("Cooldown completed.\n")
        
        # Start assessment
        print("Starting assessment...")
        started = framework.start_assessment(assessment)
        print(f"Assessment started: {started}")
        
        if started:
            # Simulate submitting responses
            print("\nSubmitting sample responses...")
            
            # Submit some correct responses
            framework.submit_response("q1", 3)  # Correct
            framework.submit_response("q2", 3)  # Correct
            framework.submit_response("q3", 1)  # Correct
            framework.submit_response("q11", [0, 1, 2])  # Correct
            framework.submit_response("q17", 1)  # Best response
            framework.submit_response("q18", 0)  # Correct ethical response
            
            # Submit some incorrect responses for variety
            framework.submit_response("q4", 2)  # Incorrect
            framework.submit_response("q12", [0, 1])  # Partially correct
            
            print("Responses submitted.\n")
            
            # Complete assessment
            print("Completing assessment...")
            try:
                report = framework.complete_assessment()
                print("Assessment completed successfully!\n")
                
                # Display results
                print("=== ASSESSMENT RESULTS ===")
                print(f"Title: {report['title']}")
                print(f"Total Score: {report['total_score']:.2f}%")
                print(f"Performance Tier: {report['performance_tier']}")
                print()
                
                print("Section Scores:")
                for section_id, section_data in report['sections'].items():
                    print(f"  {section_data['name']}: {section_data['score']:.2f}% (Weight: {section_data['weightage']}%)")
                print()
                
                if report['badges_earned']:
                    print("Badges Earned:")
                    for badge in report['badges_earned']:
                        print(f"  - {badge}")
                    print()
                
                if report['recommendations']:
                    print("Recommendations:")
                    for rec in report['recommendations']:
                        print(f"  - {rec}")
                    print()
                        
            except Exception as e:
                print(f"Error completing assessment: {e}")

def test_question_types():
    """Test different question types"""
    print("\n=== Testing Question Types ===\n")
    
    framework = AssessmentFramework()
    
    # Create sample questions of different types
    mcq_single = Question(
        id="mcq1",
        text="What is the maximum punishment for theft under Section 379 IPC?",
        type=QuestionType.SINGLE_SELECT_MCQ,
        options=[
            "1 year imprisonment",
            "3 years imprisonment", 
            "5 years imprisonment",
            "7 years imprisonment"
        ],
        correct_answers=[1],
        score=1
    )
    
    mcq_multi = Question(
        id="mcq2",
        text="Which factors undermine witness reliability?",
        type=QuestionType.MULTI_SELECT_MCQ,
        options=[
            "Distance from subject",
            "Poor lighting",
            "Witness uncertainty",
            "Time of day",
            "Weather conditions"
        ],
        correct_answers=[0, 1, 2],
        score=1
    )
    
    # Test scoring
    print("Testing MCQ scoring:")
    print(f"Single select correct: {framework.scoring_engine._score_question(mcq_single, 1)} point(s)")
    print(f"Single select incorrect: {framework.scoring_engine._score_question(mcq_single, 0)} point(s)")
    print(f"Multi select correct: {framework.scoring_engine._score_question(mcq_multi, [0, 1, 2])} point(s)")
    print(f"Multi select partial: {framework.scoring_engine._score_question(mcq_multi, [0, 1])} point(s)")
    print(f"Multi select incorrect: {framework.scoring_engine._score_question(mcq_multi, [3, 4])} point(s)")

if __name__ == "__main__":
    # Run the demonstration
    run_sample_assessment()
    
    # Test question types
    test_question_types()
    
    print("\n=== Demo Completed ===")