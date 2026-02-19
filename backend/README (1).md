# 🏦 EcoFlex - Economic Flexibility Platform
### Complete Setup Guide for Beginners

---

## 📁 PROJECT STRUCTURE

```
your-project/
│
├── backend/                   ← Spring Boot (Java)
│   ├── pom.xml
│   ├── application.properties
│   ├── EconomicFlexibilityApplication.java
│   ├── entity/
│   │   ├── User.java
│   │   ├── FamilyMember.java
│   │   ├── FinancialProfile.java
│   │   └── ResilienceTracker.java
│   ├── repository/
│   │   └── Repositories.java   (split into 4 files - see note)
│   ├── security/
│   │   ├── JwtUtil.java
│   │   ├── JwtAuthFilter.java
│   │   └── SecurityConfig.java
│   ├── service/
│   │   └── FormulaService.java
│   ├── dto/
│   │   └── AuthDTOs.java
│   └── controller/
│       ├── AuthController.java
│       ├── ProfileController.java
│       └── FeatureControllers.java
│
└── frontend/                  ← React (Vite)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        └── App.jsx
```

---

## 🛠️ STEP 1: SETUP MYSQL DATABASE

Open MySQL Workbench or MySQL CLI and run:
```sql
CREATE DATABASE economic_db;
```
That's all — Spring Boot will auto-create all tables.

---

## 🛠️ STEP 2: SETUP SPRING BOOT PROJECT

### Option A: Using Spring Initializr (Recommended for beginners)
1. Go to https://start.spring.io
2. Select:
   - Project: **Maven**
   - Language: **Java**
   - Spring Boot: **3.2.0**
   - Java: **17**
3. Add Dependencies: **Spring Web, Spring Data JPA, Spring Security, MySQL Driver, Lombok, Validation**
4. Click **Generate** and extract the zip

### Option B: Copy pom.xml
Use the provided `pom.xml` directly.

---

## 🛠️ STEP 3: FOLDER STRUCTURE IN SPRING BOOT

Inside `src/main/java/com/economic/`, create these packages:
```
com.economic
├── entity
├── repository
├── security
├── service
├── dto
└── controller
```

**IMPORTANT: Split the `Repositories.java` file into 4 separate files:**
- `UserRepository.java`
- `FamilyMemberRepository.java`  
- `FinancialProfileRepository.java`
- `ResilienceTrackerRepository.java`

Each file has only the interface shown in `Repositories.java`.

**IMPORTANT: Split `FeatureControllers.java` into 4 files:**
- `EconomicStabilityController.java`
- `ShockSimulationController.java`
- `OpportunityController.java`
- `ResilienceTrackerController.java`

---

## 🛠️ STEP 4: CONFIGURE DATABASE

Open `src/main/resources/application.properties` and change:
```properties
spring.datasource.password=your_password_here
```
Replace with your actual MySQL root password.

---

## 🛠️ STEP 5: RUN BACKEND

In your IDE (IntelliJ or Eclipse):
- Right-click `EconomicFlexibilityApplication.java` → Run
- OR in terminal: `mvn spring-boot:run`

Backend runs at: **http://localhost:8080**

---

## 🛠️ STEP 6: SETUP REACT FRONTEND

```bash
# Create Vite React app
npm create vite@latest ecoflex-frontend -- --template react

# Go into folder
cd ecoflex-frontend

# Install dependencies
npm install

# Copy App.jsx content into src/App.jsx
# Copy main.jsx content into src/main.jsx

# Run frontend
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 🗺️ API REFERENCE

### AUTH APIs
```
POST /api/auth/register   → Register new user
POST /api/auth/login      → Login (returns JWT token)
```

### PROFILE APIs (requires JWT token in header)
```
GET  /api/profile          → Get full profile
POST /api/profile/financial → Save financial details
POST /api/profile/members  → Save family members
GET  /api/profile/members  → Get family members
```

### FEATURE APIs (requires JWT token)
```
GET  /api/economic-score              → Get Economic Flexibility Score
POST /api/shock-simulate              → Simulate financial shock
POST /api/opportunity-simulate        → Simulate opportunity
POST /api/resilience-tracker          → Save monthly resilience data
GET  /api/resilience-tracker/history  → Get resilience history
```

### HOW TO SEND JWT TOKEN
All protected endpoints need this header:
```
Authorization: Bearer <your_token_here>
```

---

## 📊 SHOCK TYPES FOR SIMULATION

Send in `shockType` field:
- `JOB_LOSS` — Complete job loss
- `INCOME_DROP_20` — 20% income drop
- `INCOME_DROP_30` — 30% income drop
- `MEDICAL_EMERGENCY` — One-time expense (send `shockValue`)
- `MIGRATION_COST` — One-time cost (send `shockValue`)
- `SCHOOL_FEE_INCREASE` — Monthly increase (send `shockValue`)

---

## 🧮 FORMULAS USED

### Economic Flexibility Score
```
EFS = (0.4 × EBR) + (0.2 × IDS) - (0.2 × DR) + (0.2 × ISF)

EBR = Savings / Monthly Expenses
IDS = Earners / 3 (max)
DR  = Dependents / Earners
ISF = Average stability score (0.4/0.7/0.9)
```

### Shock Simulation
```
SurvivalMonths = Savings / Monthly Deficit
```

### Opportunity Mode
```
NewIncome    = CurrentIncome + (Probability × IncomeIncrease)
BreakEven    = Investment / (Probability × IncomeIncrease)
```

### Resilience Score (0-100)
```
HR = 25×EFR + 25×IDS + 20×SS + 15×(ΔSavings/1000) + 15×(ΔDebt/1000)
```

---

## ⚡ TECH STACK

| Layer    | Technology       |
|----------|-----------------|
| Backend  | Spring Boot 3.2  |
| Database | MySQL 8         |
| Security | JWT + BCrypt    |
| Frontend | React + Vite    |

---

## 🔥 HACKATHON TIPS

1. **Run backend first**, then frontend
2. **Register → Login → Complete Profile** (in this order!)
3. After profile setup, all 4 features work automatically
4. The formulas run **entirely server-side** in Java
5. All API calls use **Bearer token authentication**

---

## 🆘 COMMON ERRORS & FIXES

| Error | Fix |
|-------|-----|
| CORS error in browser | Check `SecurityConfig.java` allowed origins |
| 403 Forbidden | Token missing or expired — login again |
| "Financial profile not found" | Complete profile setup first |
| MySQL connection error | Check password in `application.properties` |
| Port 8080 busy | Change `server.port=8081` in properties |
