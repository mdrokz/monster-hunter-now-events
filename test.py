import spacy
import re
from datetime import datetime

# Load the English NER model
nlp = spacy.load("en_core_web_sm")

# Given content
content = """
A cherry-colored season: Investigate a new subspecies!
Cherry-colored Rathian scales, different from those of a normal Rathian, have been discovered in Forest Habitats! These traces seem to indicate some kind of change in the ecosystem.
It seems that the Queen of the Land and her cherry-colored counterpart will soon descend upon us…
Hunters, make your preparations and head out to Forest Habitats to investigate!
Dates & Times (local time):
Pink Rathian will appear during the following times:
Monday, October 9, 2023, 9:00 a.m. to Sunday, October 15, 2023, 4:00 p.m.
Rathian and Pink Rathian will appear more frequently during the following times:
Friday, October 13, 2023, from 5:00 p.m. to 8:00 p.m.
Saturday, October 14, 2023, from 1:00 p.m. to 4:00 p.m.
Sunday, October 15, 2023, from 1:00 p.m. to 4:00 p.m.
Event Details:
From Monday, October 9, at 9:00 a.m. until Sunday, October 15, at 4:00 p.m., Pink Rathian will appear in low numbers in Forest Habitats.
Pink Rathian will appear as long as you have unlocked Rathian hunts (by completing Chapter 9).
While appearance rates are boosted between Friday, October 13, and Sunday, October 15, in Forest Habitats, Rathian will appear more frequently than usual and Pink Rathian will also be easier to find.
Additional Information
While appearance rates are boosted between Friday, October 13, and Sunday, October 15, Rathian and Pink Rathian will appear in Forest Habitats for all hunters HR11 and above.
"""

# Process the content with spaCy
doc = nlp(content)

# Extract monsters using NER (assuming they are labeled as ORG or PRODUCT)
monsters = list(set([ent.text for ent in doc.ents if ent.label_ in ["ORG", "PRODUCT"] and ent.text in ["Rathian", "Pink Rathian"]]))

# Extract habitats
habitats = ["Forest"] if "Forest Habitats" in content else []

# Extract date and time intervals
date_time_intervals = []
date_pattern = r"(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}"
time_pattern = r"\d{1,2}:\d{2} (?:a.m.|p.m.)"

matches = re.findall(f"({date_pattern}) from ({time_pattern}) to ({time_pattern})", content)
for match in matches:
    date_str, start_time_str, end_time_str = match
    date_format = "%A, %B %d, %Y"
    time_format = "%I:%M %p"
    start_datetime_str = datetime.strptime(f"{date_str} {start_time_str}", f"{date_format} {time_format}").strftime("%Y-%m-%dT%H:%M:%S")
    end_datetime_str = datetime.strptime(f"{date_str} {end_time_str}", f"{date_format} {time_format}").strftime("%Y-%m-%dT%H:%M:%S")
    date_time_intervals.append({
        "start": start_datetime_str,
        "end": end_datetime_str,
        "allDay": False
    })

# Construct the JSON
event_json = {
    "events": [{
        "summary": "A cherry-colored season: Investigate a new subspecies!",
        "description": "Cherry-colored Rathian scales, different from those of a normal Rathian, have been discovered in Forest Habitats! ...",
        "dates": date_time_intervals,
        "habitat": habitats,
        "monsters": monsters
    }]
}

print(event_json)
