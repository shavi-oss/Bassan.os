# Bassan.os Documentation Archive Guide

## Overview

This guide provides instructions for archiving legacy documentation from previous versions of Bassan.os.

## Archive Structure

```
BassanOs/
├── Archive/
│   ├── README.md (Created)
│   ├── v2.0/ (To be created)
│   ├── v1.x/ (To be created)
│   └── Arabic/ (To be created)
├── BDDR/ (To be archived to v2.0)
├── BDR/ (To be archived to v1.x and Arabic)
└── Generated/ (Current documentation)
```

## Archiving Instructions

### Step 1: Create Archive Directories

Create the following directories under Archive/:
- Archive/v2.0/
- Archive/v1.x/
- Archive/Arabic/

### Step 2: Archive v2.0 Documentation

Move all files from BDDR/ to Archive/v2.0/:
- Bassan.os API Specifications v2.0.md
- Bassan.os Complete Delivery Plan v2.txt
- Bassan.os Database ERD v2.0.md
- Bassan.os Deployment Architecture v2.0.md
- Bassan.os Execution Hardening & Technical Deep Design v2.1.txt
- Bassan.os Execution Status Report.md
- Bassan.os File Status Table.md
- Bassan.os Final Execution Status Report v2.0.md
- Bassan.os Gap Analysis Report v2.0.md
- Bassan.os Technical Architecture v2.txt
- Bassan.os User Stories Catalog v2.0.md
- Business Requirements Document (BRD) v2.0.txt

### Step 3: Archive v1.x Documentation

Move the following files from BDR/ to Archive/v1.x/:
- Architecture Board Re-Submission.txt
- BUSINESS REQUIREMENTS DOCUMENT (Bassan os.txt
- Bassan.os Personas & User Stories – Enterprise Edition.md
- Bassan.os – C4 Model Architecture.txt
- Bassan.os – Consolidated Traceability Matrix.txt

### Step 4: Archive Arabic Documentation

Move the following folders and files to Archive/Arabic/:
- BDR/New folder/ (all contents)
- BDR/templates User Stories for Persona/ (all contents)

### Step 5: Remove Empty Directories

After moving all files, remove the empty directories:
- BDDR/
- BDR/

## Verification

After archiving, verify that:
1. All legacy files have been moved to Archive/
2. No files remain in BDDR/ or BDR/
3. The Generated/ folder contains all current documentation
4. The Archive/README.md accurately describes the archive structure

## Current Documentation Status

The Generated/ folder now contains all current v2.2 documentation:
- 1_Business_Requirements_Document.md
- 2_Personas_and_User_Stories.md
- 3_User_Stories_Catalog.md
- 4_Database_ERD.md
- 5_Technical_Architecture.md
- 6_Deep_Design_Hardening.md
- 7_API_Specifications.md
- 8_Deployment_Architecture.md
- 9_Gap_Analysis_Report.md
- 10_Runbooks_Security.md
- 11_Mobile_Architecture.md
- 12_Integration_Runbooks.md
- 13_Testing_Strategy.md
- 14_Data_Migration_Strategy.md
- 15_Performance_Benchmarks.md
- 17_Compliance_Framework.md
- 18_Developer_Onboarding.md

## Notes

- Arabic documentation in Archive/Arabic/ should be retained as reference for localization work
- All audit reports in Generated/ should be retained for historical reference
- The Archive/README.md should be updated if any additional files are archived

## Contact

For questions about the archiving process or documentation structure, please contact the documentation team.
