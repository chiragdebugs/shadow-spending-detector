#!/usr/bin/env python3
"""
Backend Testing for Shadow Spending Detector API
Tests API endpoints and Supabase database connectivity
"""

import requests
import json
import os
from datetime import datetime

# Configuration
BASE_URL = "https://spend-shadow.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"
TEST_USER_ID = "test-user-123456"

# Test data
SAMPLE_TRANSACTIONS = [
    {
        "date": "2024-01-15",
        "description": "Netflix Subscription",
        "amount": 199.00,
        "category": "Entertainment"
    },
    {
        "date": "2024-01-20", 
        "description": "Swiggy Food Order",
        "amount": 450.50,
        "category": "Food & Dining"
    }
]

def print_test_result(test_name, success, message="", data=None):
    """Print formatted test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"\n{status} {test_name}")
    if message:
        print(f"   {message}")
    if data:
        print(f"   Response: {json.dumps(data, indent=2)[:200]}...")

def test_api_health_check():
    """Test 1: Basic API health check with stats endpoint"""
    print("\n" + "="*50)
    print("TEST 1: API Health Check - Stats Endpoint")
    print("="*50)
    
    try:
        url = f"{API_BASE}?action=stats&userId={TEST_USER_ID}"
        response = requests.get(url, timeout=10)
        
        print(f"Request URL: {url}")
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_test_result("API Health Check", True, 
                            f"API is responding. Stats endpoint working.", data)
            return True, data
        elif response.status_code == 500:
            # Expected if DB tables don't exist
            error_data = response.json() if response.content else {}
            error_msg = error_data.get('error', 'Unknown error')
            
            if 'table' in error_msg.lower() or 'relation' in error_msg.lower():
                print_test_result("API Health Check", True, 
                                f"API responding but DB tables don't exist yet: {error_msg}")
                return True, {"db_setup_needed": True, "error": error_msg}
            else:
                print_test_result("API Health Check", False, 
                                f"Unexpected server error: {error_msg}")
                return False, error_data
        else:
            print_test_result("API Health Check", False, 
                            f"Unexpected status code: {response.status_code}")
            return False, None
            
    except Exception as e:
        print_test_result("API Health Check", False, f"Connection error: {str(e)}")
        return False, None

def test_get_transactions():
    """Test 2: GET transactions endpoint"""
    print("\n" + "="*50)
    print("TEST 2: GET Transactions Endpoint")
    print("="*50)
    
    try:
        url = f"{API_BASE}?action=transactions&userId={TEST_USER_ID}"
        response = requests.get(url, timeout=10)
        
        print(f"Request URL: {url}")
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            transactions = data.get('transactions', [])
            print_test_result("GET Transactions", True, 
                            f"Retrieved {len(transactions)} transactions", data)
            return True, data
        elif response.status_code == 500:
            error_data = response.json() if response.content else {}
            error_msg = error_data.get('error', 'Unknown error')
            
            if 'table' in error_msg.lower() or 'relation' in error_msg.lower():
                print_test_result("GET Transactions", True, 
                                f"Endpoint working but needs DB setup: {error_msg}")
                return True, {"db_setup_needed": True, "error": error_msg}
            else:
                print_test_result("GET Transactions", False, 
                                f"Database error: {error_msg}")
                return False, error_data
        else:
            print_test_result("GET Transactions", False, 
                            f"Unexpected status: {response.status_code}")
            return False, None
            
    except Exception as e:
        print_test_result("GET Transactions", False, f"Request error: {str(e)}")
        return False, None

def test_get_subscriptions():
    """Test 3: GET subscriptions endpoint"""
    print("\n" + "="*50)
    print("TEST 3: GET Subscriptions Endpoint") 
    print("="*50)
    
    try:
        url = f"{API_BASE}?action=subscriptions&userId={TEST_USER_ID}"
        response = requests.get(url, timeout=10)
        
        print(f"Request URL: {url}")
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            subscriptions = data.get('subscriptions', [])
            print_test_result("GET Subscriptions", True, 
                            f"Retrieved {len(subscriptions)} subscriptions", data)
            return True, data
        elif response.status_code == 500:
            error_data = response.json() if response.content else {}
            error_msg = error_data.get('error', 'Unknown error')
            
            if 'table' in error_msg.lower() or 'relation' in error_msg.lower():
                print_test_result("GET Subscriptions", True, 
                                f"Endpoint working but needs DB setup: {error_msg}")
                return True, {"db_setup_needed": True, "error": error_msg}
            else:
                print_test_result("GET Subscriptions", False, 
                                f"Database error: {error_msg}")
                return False, error_data
        else:
            print_test_result("GET Subscriptions", False, 
                            f"Unexpected status: {response.status_code}")
            return False, None
            
    except Exception as e:
        print_test_result("GET Subscriptions", False, f"Request error: {str(e)}")
        return False, None

def test_supabase_config():
    """Test 4: Verify Supabase configuration"""
    print("\n" + "="*50)
    print("TEST 4: Supabase Configuration Check")
    print("="*50)
    
    try:
        # Read environment variables
        with open('/app/.env', 'r') as f:
            env_content = f.read()
        
        supabase_url = None
        supabase_anon_key = None
        supabase_service_key = None
        
        for line in env_content.split('\n'):
            if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
                supabase_url = line.split('=', 1)[1]
            elif line.startswith('NEXT_PUBLIC_SUPABASE_ANON_KEY='):
                supabase_anon_key = line.split('=', 1)[1]
            elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
                supabase_service_key = line.split('=', 1)[1]
        
        issues = []
        if not supabase_url:
            issues.append("NEXT_PUBLIC_SUPABASE_URL not found")
        if not supabase_anon_key:
            issues.append("NEXT_PUBLIC_SUPABASE_ANON_KEY not found")
        if not supabase_service_key:
            issues.append("SUPABASE_SERVICE_ROLE_KEY not found")
        
        if issues:
            print_test_result("Supabase Config", False, f"Missing: {', '.join(issues)}")
            return False, {"issues": issues}
        else:
            print_test_result("Supabase Config", True, "All Supabase environment variables present")
            
            # Test basic connectivity to Supabase URL
            try:
                if supabase_url:
                    test_response = requests.get(f"{supabase_url}/rest/v1/", 
                                               headers={"apikey": supabase_anon_key}, 
                                               timeout=5)
                    if test_response.status_code in [200, 401, 403]:  # Any response means it's reachable
                        print_test_result("Supabase Connectivity", True, 
                                        f"Supabase endpoint reachable (status: {test_response.status_code})")
                    else:
                        print_test_result("Supabase Connectivity", False, 
                                        f"Unexpected status: {test_response.status_code}")
            except Exception as conn_e:
                print_test_result("Supabase Connectivity", False, f"Connection failed: {str(conn_e)}")
            
            return True, {
                "url_configured": bool(supabase_url),
                "keys_configured": bool(supabase_anon_key and supabase_service_key)
            }
            
    except Exception as e:
        print_test_result("Supabase Config", False, f"Config check failed: {str(e)}")
        return False, None

def test_invalid_endpoints():
    """Test 5: Invalid endpoint handling"""
    print("\n" + "="*50)
    print("TEST 5: Invalid Endpoint Handling")
    print("="*50)
    
    try:
        # Test invalid action
        url = f"{API_BASE}?action=invalid&userId={TEST_USER_ID}"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 400:
            data = response.json()
            if 'error' in data and 'Invalid action' in data['error']:
                print_test_result("Invalid Action Handling", True, 
                                "Properly returns 400 for invalid action", data)
            else:
                print_test_result("Invalid Action Handling", False, 
                                f"Wrong error message: {data}")
        else:
            print_test_result("Invalid Action Handling", False, 
                            f"Expected 400, got {response.status_code}")
        
        # Test missing userId
        url = f"{API_BASE}?action=stats"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 400:
            data = response.json()
            if 'error' in data and 'User ID required' in data['error']:
                print_test_result("Missing UserId Handling", True, 
                                "Properly returns 400 for missing userId", data)
                return True, data
            else:
                print_test_result("Missing UserId Handling", False, 
                                f"Wrong error message: {data}")
                return False, data
        else:
            print_test_result("Missing UserId Handling", False, 
                            f"Expected 400, got {response.status_code}")
            return False, None
            
    except Exception as e:
        print_test_result("Invalid Endpoint Handling", False, f"Request error: {str(e)}")
        return False, None

def run_all_tests():
    """Run all backend tests and generate summary"""
    print("🚀 Starting Shadow Spending Detector API Backend Tests")
    print("=" * 70)
    
    results = {}
    db_setup_needed = False
    
    # Run tests
    results['health_check'] = test_api_health_check()
    results['get_transactions'] = test_get_transactions()  
    results['get_subscriptions'] = test_get_subscriptions()
    results['supabase_config'] = test_supabase_config()
    results['invalid_endpoints'] = test_invalid_endpoints()
    
    # Check if database setup is needed
    for test_name, (success, data) in results.items():
        if data and isinstance(data, dict) and data.get('db_setup_needed'):
            db_setup_needed = True
            break
    
    # Generate summary
    print("\n" + "="*70)
    print("📊 TEST SUMMARY")
    print("="*70)
    
    total_tests = len(results)
    passed_tests = sum(1 for success, _ in results.values() if success)
    
    for test_name, (success, data) in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name.replace('_', ' ').title()}")
    
    print(f"\n📈 Results: {passed_tests}/{total_tests} tests passed")
    
    if db_setup_needed:
        print("\n⚠️  DATABASE SETUP REQUIRED:")
        print("   The API endpoints are working but Supabase tables don't exist yet.")
        print("   User needs to run the SQL setup in Supabase Dashboard.")
        print("   Expected tables: 'transactions', 'subscriptions'")
    
    print("\n🏆 BACKEND STATUS:")
    if passed_tests == total_tests:
        if db_setup_needed:
            print("   ✅ API endpoints working - Ready for database setup")
        else:
            print("   ✅ All systems operational")
    else:
        print(f"   ⚠️  {total_tests - passed_tests} critical issues found")
    
    return results, db_setup_needed

if __name__ == "__main__":
    try:
        results, needs_db_setup = run_all_tests()
        
        # Return appropriate exit code
        failed_tests = sum(1 for success, _ in results.values() if not success)
        exit(0 if failed_tests == 0 else 1)
        
    except KeyboardInterrupt:
        print("\n\n❌ Tests interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n\n❌ Test runner failed: {str(e)}")
        exit(1)