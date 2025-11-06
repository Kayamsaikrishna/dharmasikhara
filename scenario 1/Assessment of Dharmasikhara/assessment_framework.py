"""
Dharmasikhara Assessment Plan Implementation Framework
Post-Scenario Legal Competency Evaluation Framework
"""

import json
import time
from datetime import datetime, timedelta
from enum import Enum
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field

class QuestionType(Enum):
    SINGLE_SELECT_MCQ = "single_select_mcq"
    MULTI_SELECT_MCQ = "multi_select_mcq"
    CASE_BASED_REASONING = "case_based_reasoning"
    SITUATIONAL_JUDGMENT = "situational_judgment"
    ARGUMENT_DECONSTRUCTION = "argument_deconstruction"
    OPEN_ENDED_JUSTIFICATION = "open_ended_justification"

class PerformanceTier(Enum):
    EXEMPLARY_ADVOCATE = "A+"
    PROFICIENT_ADVOCATE = "A"
    COMPETENT_ADVOCATE = "B"
    DEVELOPING_ADVOCATE = "C"
    NEEDS_IMPROVEMENT = "F"

@dataclass
class Question:
    id: str
    text: str
    type: QuestionType
    options: List[str] = field(default_factory=list)
    correct_answers: List[int] = field(default_factory=list)
    score: int = 0
    time_limit: int = 0  # in minutes
    competency_tags: List[str] = field(default_factory=list)

@dataclass
class Section:
    id: str
    name: str
    questions: List[Question]
    time_limit: int  # in minutes
    weightage: float  # percentage

@dataclass
class Assessment:
    id: str
    title: str
    scenario: str
    sections: List[Section]
    total_time_limit: int  # in minutes
    passing_score: float = 70.0
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    user_responses: Dict[str, Any] = field(default_factory=dict)
    scores: Dict[str, float] = field(default_factory=dict)
    total_score: float = 0.0
    tier: Optional[PerformanceTier] = None

class AssessmentTrigger:
    def __init__(self):
        self.primary_activated = False
        self.secondary_activated = False
        self.completion_milestone = 0.7  # 70%
    
    def check_primary_trigger(self, scenario_completed: bool) -> bool:
        """Primary Trigger: Upon completion of courtroom scenario"""
        if scenario_completed:
            self.primary_activated = True
        return self.primary_activated
    
    def check_secondary_trigger(self, scenario_progress: float) -> bool:
        """Secondary Trigger: If user exits scenario after reaching 70% completion"""
        if scenario_progress >= self.completion_milestone:
            self.secondary_activated = True
        return self.secondary_activated

class CooldownManager:
    def __init__(self, cooldown_period: int = 120):  # 2 minutes default
        self.cooldown_period = cooldown_period
        self.start_time = None
    
    def start_cooldown(self):
        self.start_time = datetime.now()
    
    def is_active(self) -> bool:
        if not self.start_time:
            return False
        elapsed = datetime.now() - self.start_time
        return elapsed.total_seconds() < self.cooldown_period
    
    def get_remaining_time(self) -> int:
        if not self.start_time:
            return 0
        elapsed = datetime.now() - self.start_time
        remaining = self.cooldown_period - elapsed.total_seconds()
        return max(0, int(remaining))

class AssessmentTimer:
    def __init__(self, time_limit: int):
        self.time_limit = time_limit * 60  # convert to seconds
        self.start_time = None
        self.end_time = None
        self.is_running = False
    
    def start(self):
        self.start_time = datetime.now()
        self.is_running = True
    
    def stop(self):
        self.end_time = datetime.now()
        self.is_running = False
    
    def get_elapsed_time(self) -> int:
        if not self.start_time:
            return 0
        if self.is_running:
            elapsed = datetime.now() - self.start_time
        else:
            elapsed = self.end_time - self.start_time
        return int(elapsed.total_seconds())
    
    def get_remaining_time(self) -> int:
        elapsed = self.get_elapsed_time()
        return max(0, self.time_limit - elapsed)
    
    def is_time_up(self) -> bool:
        return self.get_remaining_time() <= 0

class ScoringEngine:
    @staticmethod
    def calculate_section_score(section: Section, responses: Dict[str, Any]) -> float:
        total_points = 0
        earned_points = 0
        
        for question in section.questions:
            total_points += question.score
            response = responses.get(question.id)
            
            if response is not None:
                earned_points += ScoringEngine._score_question(question, response)
        
        return (earned_points / total_points) * 100 if total_points > 0 else 0
    
    @staticmethod
    def _score_question(question: Question, response: Any) -> int:
        if question.type == QuestionType.SINGLE_SELECT_MCQ:
            if response in question.correct_answers:
                return question.score
        elif question.type == QuestionType.MULTI_SELECT_MCQ:
            # Full points only if all correct selections made, no partial credit
            if set(response) == set(question.correct_answers):
                return question.score
        elif question.type == QuestionType.CASE_BASED_REASONING:
            # Rubric-based scoring (0-4 points per question)
            # Assuming response is a score between 0-4
            return min(4, max(0, response))
        elif question.type == QuestionType.SITUATIONAL_JUDGMENT:
            # Scoring based on appropriateness ranking
            # Best answer (3 pts), Acceptable (2 pts), Poor (1 pt), Unethical (0 pts)
            scoring_map = {0: 3, 1: 2, 2: 1, 3: 0}  # Assuming response is index of selected option
            return scoring_map.get(response, 0)
        elif question.type == QuestionType.ARGUMENT_DECONSTRUCTION:
            # AI-assisted rubric scoring
            # Assuming response is a score based on rubric
            return min(question.score, max(0, response))
        elif question.type == QuestionType.OPEN_ENDED_JUSTIFICATION:
            # AI + Peer/Expert review scoring
            # Assuming response is a score based on holistic rubric
            return min(question.score, max(0, response))
        
        return 0
    
    @staticmethod
    def determine_performance_tier(percentage: float) -> PerformanceTier:
        if percentage >= 90:
            return PerformanceTier.EXEMPLARY_ADVOCATE
        elif percentage >= 80:
            return PerformanceTier.PROFICIENT_ADVOCATE
        elif percentage >= 70:
            return PerformanceTier.COMPETENT_ADVOCATE
        elif percentage >= 60:
            return PerformanceTier.DEVELOPING_ADVOCATE
        else:
            return PerformanceTier.NEEDS_IMPROVEMENT

class AssessmentFramework:
    def __init__(self):
        self.trigger = AssessmentTrigger()
        self.cooldown = CooldownManager()
        self.current_assessment: Optional[Assessment] = None
        self.timer: Optional[AssessmentTimer] = None
        self.scoring_engine = ScoringEngine()
    
    def activate_assessment(self, scenario_completed: bool = False, 
                          scenario_progress: float = 0.0) -> bool:
        """Activate assessment based on triggers"""
        primary = self.trigger.check_primary_trigger(scenario_completed)
        secondary = self.trigger.check_secondary_trigger(scenario_progress)
        
        if primary or secondary:
            self.cooldown.start_cooldown()
            return True
        return False
    
    def is_cooldown_active(self) -> bool:
        """Check if cooldown period is active"""
        return self.cooldown.is_active()
    
    def get_cooldown_remaining(self) -> int:
        """Get remaining cooldown time in seconds"""
        return self.cooldown.get_remaining_time()
    
    def start_assessment(self, assessment: Assessment) -> bool:
        """Start the assessment if cooldown is finished"""
        if self.is_cooldown_active():
            return False
        
        self.current_assessment = assessment
        self.timer = AssessmentTimer(assessment.total_time_limit)
        self.timer.start()
        return True
    
    def submit_response(self, question_id: str, response: Any):
        """Submit user response for a question"""
        if self.current_assessment:
            self.current_assessment.user_responses[question_id] = response
    
    def complete_assessment(self) -> Dict[str, Any]:
        """Complete assessment and calculate scores"""
        if not self.current_assessment or not self.timer:
            raise Exception("No assessment in progress")
        
        self.timer.stop()
        self.current_assessment.completed_at = datetime.now()
        
        # Calculate section scores
        total_weighted_score = 0
        for section in self.current_assessment.sections:
            section_score = self.scoring_engine.calculate_section_score(
                section, self.current_assessment.user_responses)
            self.current_assessment.scores[section.id] = section_score
            total_weighted_score += section_score * (section.weightage / 100)
        
        self.current_assessment.total_score = total_weighted_score
        self.current_assessment.tier = self.scoring_engine.determine_performance_tier(
            total_weighted_score)
        
        return self._generate_assessment_report()
    
    def _generate_assessment_report(self) -> Dict[str, Any]:
        """Generate detailed assessment report"""
        if not self.current_assessment:
            return {}
        
        report = {
            "assessment_id": self.current_assessment.id,
            "title": self.current_assessment.title,
            "scenario": self.current_assessment.scenario,
            "completed_at": self.current_assessment.completed_at.isoformat(),
            "total_score": self.current_assessment.total_score,
            "performance_tier": self.current_assessment.tier.value,
            "sections": {},
            "recommendations": [],
            "badges_earned": []
        }
        
        # Add section details
        for section in self.current_assessment.sections:
            section_id = section.id
            report["sections"][section_id] = {
                "name": section.name,
                "score": self.current_assessment.scores.get(section_id, 0),
                "weightage": section.weightage
            }
        
        # Add recommendations based on performance
        if self.current_assessment.total_score < 70:
            report["recommendations"].append("Must complete micro-learning modules on weak areas before scenario retry")
        elif self.current_assessment.total_score < 80:
            report["recommendations"].append("Proceed with advisory notes")
        
        # Add badges based on performance
        self._award_badges(report)
        
        return report
    
    def _award_badges(self, report: Dict[str, Any]):
        """Award badges based on performance"""
        score = self.current_assessment.total_score
        sections = self.current_assessment.sections
        
        # Scenario-specific badges
        if score >= 70:
            report["badges_earned"].append("Bronze Star")
        if score >= 80:
            report["badges_earned"].append("Silver Star")
        if score >= 90:
            report["badges_earned"].append("Gold Star")
        
        # Special badges
        ethics_section = next((s for s in sections if s.id == "ethics"), None)
        if ethics_section and self.current_assessment.scores.get("ethics", 0) == 100:
            report["badges_earned"].append("Guardian of Justice")
        
        case_analysis_section = next((s for s in sections if s.id == "case_analysis"), None)
        if case_analysis_section and self.current_assessment.scores.get("case_analysis", 0) >= 95:
            report["badges_earned"].append("Analytical Mind")

# Example usage
if __name__ == "__main__":
    # Create sample assessment
    framework = AssessmentFramework()
    
    # Sample questions
    q1 = Question(
        id="q1",
        text="According to Section 437 of CrPC, which of the following is NOT a valid ground for granting bail in a theft case?",
        type=QuestionType.SINGLE_SELECT_MCQ,
        options=[
            "The accused is unlikely to commit another offense while on bail",
            "The accused has a permanent residence and strong community ties",
            "The accused has no prior criminal record",
            "The complainant has agreed to withdraw the case"
        ],
        correct_answers=[3],  # Option D
        score=1,
        competency_tags=["Legal Knowledge", "Criminal Procedure"]
    )
    
    q2 = Question(
        id="q2",
        text="Review this excerpt from your witness interview with the security guard: Which THREE factors undermine the reliability of this identification?",
        type=QuestionType.MULTI_SELECT_MCQ,
        options=[
            "Distance from the subject",
            "Poor lighting conditions",
            "Witness's expressed uncertainty (70% confidence)",
            "The witness was off-duty at the time",
            "Time of day (evening)",
            "Witness has a financial interest in the case"
        ],
        correct_answers=[0, 1, 2],  # Options A, B, C
        score=1,
        competency_tags=["Case Analysis", "Evidence Evaluation"]
    )
    
    # Sample sections
    section_a = Section(
        id="legal_knowledge",
        name="Legal Knowledge & Procedure",
        questions=[q1],
        time_limit=10,
        weightage=20.0
    )
    
    section_b = Section(
        id="case_analysis",
        name="Case Analysis & Reasoning",
        questions=[q2],
        time_limit=15,
        weightage=30.0
    )
    
    # Sample assessment
    assessment = Assessment(
        id="assess_001",
        title="Theft/Bail Application Assessment",
        scenario="Theft case involving laptop from office premises",
        sections=[section_a, section_b],
        total_time_limit=45,
        passing_score=70.0
    )
    
    # Activate assessment
    framework.activate_assessment(scenario_completed=True)
    
    # Wait for cooldown (in real implementation, this would be handled differently)
    import time
    time.sleep(2)
    
    # Start assessment
    framework.start_assessment(assessment)
    
    # Submit sample responses
    framework.submit_response("q1", 3)  # Correct answer
    framework.submit_response("q2", [0, 1, 2])  # Correct answers
    
    # Complete assessment
    report = framework.complete_assessment()
    print(json.dumps(report, indent=2))