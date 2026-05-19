import time
import json
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import database
import server

def test_vitals():
    start = time.time()
    vitals = server.get_analytics_vitals(dept=None, user={"role": "sysadmin"})
    latency = (time.time() - start) * 1000
    print(f"Vitals Query Speed: {latency:.1f}ms")
    print(f"Total Tickets: {vitals['data']['total']}")
    print(f"SLA Met %: {vitals['data']['sla_met_pct']}%")
    assert vitals["data"]["total"] == 5475, "Expected 5475 records"
    print("Vitals Check: PASS\n")

def test_categories():
    start = time.time()
    categories = server.get_analytics_categories(dept=None, user={"role": "sysadmin"})
    latency = (time.time() - start) * 1000
    print(f"Categories Query Speed: {latency:.1f}ms")
    print(f"Top Categories Count: {len(categories['data']['services'])}")
    print("Categories Check: PASS\n")

def test_technicians():
    start = time.time()
    techs = server.get_analytics_technicians(dept=None, user={"role": "sysadmin"})
    latency = (time.time() - start) * 1000
    print(f"Technicians Query Speed: {latency:.1f}ms")
    print(f"Top Techs Count: {len(techs['data']['technicians'])}")
    print("Technicians Check: PASS\n")

def test_trends():
    start = time.time()
    trends = server.get_analytics_trends(dept=None, user={"role": "sysadmin"})
    latency = (time.time() - start) * 1000
    print(f"Trends & Anomalies Query Speed: {latency:.1f}ms")
    print(f"Months Count: {len(trends['data']['trends'])}")
    print("Trends Check: PASS\n")

if __name__ == "__main__":
    print("Running SLA Analytics Intelligence Tests...")
    test_vitals()
    test_categories()
    test_technicians()
    test_trends()
    print("All tests completed successfully!")
