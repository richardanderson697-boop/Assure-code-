# ============================================================================
# ASSURE CODE - Flask Compliance Scanner (Fixed for Railway)
# ============================================================================

# ============================================================================
# 1. app.py - Your Main Application (Fixed)
# ============================================================================
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
import json
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for frontend access
CORS(app, origins=['*'])

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize OpenAI client with error handling
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    logger.warning("⚠️  OPENAI_API_KEY not set - AI features will be limited")
    client = None
else:
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        logger.info("✅ OpenAI client initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize OpenAI: {str(e)}")
        client = None

# Configuration
GOLD_STANDARD_THRESHOLD = float(os.getenv('OPENAI_SCANNER_THRESHOLD', '90.0'))
MODEL = os.getenv('OPENAI_SCANNER_MODEL', 'gpt-4-turbo-preview')

# ============================================================================
# Compliance Scorer Class
# ============================================================================
class ComplianceScorer:
    def __init__(self):
        self.model = MODEL
        self.client = client
    
    def validate_specification(
        self, 
        draft_content: Dict, 
        target_frameworks: Optional[List[str]] = None
    ) -> Dict:
        """
        Validate a specification against compliance frameworks
        
        Args:
            draft_content: The specification to validate
            target_frameworks: List of frameworks to check (e.g., ['GDPR', 'PCI DSS'])
        
        Returns:
            Dictionary with compliance score and recommendations
        """
        logger.info(f"Starting validation with model {self.model}")
        
        if not self.client:
            return self._mock_response()
        
        try:
            # Extract specification text
            spec_text = self._extract_text(draft_content)
            
            # Identify applicable regulations
            regulations = self._identify_regulations(spec_text, target_frameworks)
            
            # Score compliance for each regulation
            scores = self._score_regulations(spec_text, regulations)
            
            # Calculate overall score
            overall_score = self._calculate_overall_score(scores)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(spec_text, scores)
            
            passed = overall_score >= GOLD_STANDARD_THRESHOLD
            
            return {
                'compliance_score': round(overall_score, 2),
                'passed_gold_standard': passed,
                'threshold': GOLD_STANDARD_THRESHOLD,
                'regulations_analyzed': regulations,
                'detailed_scores': scores,
                'recommendations': recommendations,
                'timestamp': datetime.utcnow().isoformat(),
                'model_used': self.model
            }
            
        except Exception as e:
            logger.error(f"Validation error: {str(e)}")
            return {
                'error': str(e),
                'compliance_score': 0,
                'passed_gold_standard': False,
                'recommendations': ['Unable to complete validation']
            }
    
    def _extract_text(self, draft_content: Dict) -> str:
        """Extract text from draft content"""
        if isinstance(draft_content, str):
            return draft_content
        
        if 'specification_text' in draft_content:
            return draft_content['specification_text']
        
        if 'text' in draft_content:
            return draft_content['text']
        
        return json.dumps(draft_content)
    
    def _identify_regulations(
        self, 
        spec_text: str, 
        target_frameworks: Optional[List[str]]
    ) -> List[str]:
        """Identify applicable regulations using OpenAI"""
        if not self.client:
            return target_frameworks or ['GDPR', 'SOC 2']
        
        prompt = f"""Analyze this specification and identify ALL applicable regulations.

Specification (first 2000 chars):
{spec_text[:2000]}

Target frameworks: {', '.join(target_frameworks) if target_frameworks else 'All applicable'}

Return ONLY a JSON array like: ["GDPR", "PCI DSS", "SOC 2"]"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a compliance expert."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=200
            )
            
            content = response.choices[0].message.content
            cleaned = content.replace('```json', '').replace('```', '').strip()
            regulations = json.loads(cleaned)
            
            logger.info(f"Identified regulations: {regulations}")
            return regulations
            
        except Exception as e:
            logger.error(f"Regulation identification error: {str(e)}")
            return target_frameworks or ['GDPR', 'SOC 2']
    
    def _score_regulations(self, spec_text: str, regulations: List[str]) -> Dict:
        """Score compliance for each regulation"""
        scores = {}
        
        for reg in regulations:
            try:
                score = self._score_single_regulation(spec_text, reg)
                scores[reg] = score
            except Exception as e:
                logger.error(f"Error scoring {reg}: {str(e)}")
                scores[reg] = {
                    'score': 70.0,
                    'status': 'error',
                    'issues': [str(e)]
                }
        
        return scores
    
    def _score_single_regulation(self, spec_text: str, regulation: str) -> Dict:
        """Score compliance for a single regulation"""
        if not self.client:
            return {
                'score': 85.0,
                'status': 'partial',
                'issues': ['Mock scoring - OpenAI not configured']
            }
        
        prompt = f"""Evaluate compliance with {regulation} for this specification.

Specification (first 1500 chars):
{spec_text[:1500]}

Provide:
1. Compliance score (0-100)
2. Key issues found
3. Status: 'compliant', 'partial', or 'non-compliant'

Return ONLY valid JSON:
{{
  "score": 85.5,
  "status": "partial",
  "issues": ["Missing data retention policy", "Incomplete encryption specs"]
}}"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a {regulation} compliance auditor."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            content = response.choices[0].message.content
            cleaned = content.replace('```json', '').replace('```', '').strip()
            result = json.loads(cleaned)
            
            return result
            
        except Exception as e:
            logger.error(f"Scoring error for {regulation}: {str(e)}")
            return {
                'score': 75.0,
                'status': 'error',
                'issues': [f'Scoring failed: {str(e)}']
            }
    
    def _calculate_overall_score(self, scores: Dict) -> float:
        """Calculate weighted overall compliance score"""
        if not scores:
            return 0.0
        
        total = sum(s['score'] for s in scores.values())
        return total / len(scores)
    
    def _generate_recommendations(self, spec_text: str, scores: Dict) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        for reg, data in scores.items():
            if data['score'] < GOLD_STANDARD_THRESHOLD:
                recommendations.extend([
                    f"{reg}: {issue}" for issue in data.get('issues', [])
                ])
        
        return recommendations[:10]  # Limit to top 10
    
    def _mock_response(self) -> Dict:
        """Return mock response when OpenAI is not available"""
        logger.warning("Using mock response - OpenAI not configured")
        return {
            'compliance_score': 75.0,
            'passed_gold_standard': False,
            'threshold': GOLD_STANDARD_THRESHOLD,
            'regulations_analyzed': ['GDPR', 'SOC 2'],
            'detailed_scores': {
                'GDPR': {'score': 70.0, 'status': 'partial', 'issues': ['Mock mode']},
                'SOC 2': {'score': 80.0, 'status': 'partial', 'issues': ['Mock mode']}
            },
            'recommendations': [
                'OpenAI API not configured - add OPENAI_API_KEY environment variable',
                'This is a mock response for testing'
            ],
            'timestamp': datetime.utcnow().isoformat(),
            'model_used': 'mock'
        }

# ============================================================================
# API Endpoints
# ============================================================================

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with API information"""
    return jsonify({
        'service': 'ASSURE CODE Compliance Scanner',
        'version': '1.0.0',
        'status': 'operational',
        'openai_configured': client is not None,
        'endpoints': {
            'scan': 'POST /scan',
            'health': 'GET /health'
        }
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint for Railway"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'services': {
            'openai': client is not None,
            'flask': True
        },
        'config': {
            'threshold': GOLD_STANDARD_THRESHOLD,
            'model': MODEL
        }
    })

@app.route('/scan', methods=['POST'])
def scan():
    """
    Main scanning endpoint
    
    Request body:
    {
        "specification_text": "Your specification here...",
        "target_frameworks": ["GDPR", "PCI DSS"]  // optional
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No JSON data provided'
            }), 400
        
        # Extract parameters
        target_frameworks = data.get('target_frameworks', None)
        
        # Initialize scorer and validate
        scorer = ComplianceScorer()
        result = scorer.validate_specification(data, target_frameworks)
        
        logger.info(f"Scan completed: score={result.get('compliance_score', 0)}")
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Scan endpoint error: {str(e)}")
        return jsonify({
            'error': str(e),
            'compliance_score': 0,
            'passed_gold_standard': False
        }), 500

# ============================================================================
# Run the application
# ============================================================================
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"🚀 Starting Flask app on port {port}")
    logger.info(f"🔧 Debug mode: {debug}")
    logger.info(f"✅ OpenAI configured: {client is not None}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)

# ============================================================================
# 2. requirements.txt - Python Dependencies
# ============================================================================
"""
flask==3.0.0
flask-cors==4.0.0
openai==1.12.0
gunicorn==21.2.0
python-dotenv==1.0.0
"""

# ============================================================================
# 3. Procfile - Railway Start Command
# ============================================================================
"""
web: gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
"""

# ============================================================================
# 4. runtime.txt - Python Version
# ============================================================================
"""
python-3.11.7
"""

# ============================================================================
# 5. .env.example - Environment Variables
# ============================================================================
"""
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_SCANNER_THRESHOLD=90.0
OPENAI_SCANNER_MODEL=gpt-4-turbo-preview
PORT=5000
FLASK_ENV=production
"""

# ============================================================================
# DEPLOYMENT CHECKLIST
# ============================================================================
"""
✅ Create these files in your project root:
   1. app.py (this file)
   2. requirements.txt
   3. Procfile
   4. runtime.txt (optional)

✅ In Railway Dashboard:
   1. Go to Variables tab
   2. Add: OPENAI_API_KEY=sk-proj-your-actual-key
   3. Add: PORT=${{PORT}} (Railway provides this)
   4. Optional: OPENAI_SCANNER_THRESHOLD=90.0

✅ Push to GitHub:
   git add .
   git commit -m "Fix Flask app for Railway"
   git push origin main

✅ Railway will auto-deploy

✅ Test endpoints:
   https://your-app.railway.app/health
   https://your-app.railway.app/scan (POST)
"""
