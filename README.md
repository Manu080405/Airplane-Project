# Smartphone Market Analysis and Marketing Budget Prediction

**A Data Science and Machine Learning Project**

## 1. Project Overview

This project focuses on analysing smartphone market data and developing a machine learning model to estimate marketing budgets based on smartphone and customer-related characteristics.

The project follows a two-stage data science workflow. Stage 1 involves data inspection, MySQL database integration, SQL-based exploratory data analysis, and visualization. Stage 2 focuses on consolidating the datasets, analysing regional smartphone pricing, engineering a marketing budget feature, selecting relevant predictors, and developing a Linear Regression model.

The project uses three interconnected datasets containing smartphone specifications, user demographics, and smartphone ratings. By combining these datasets, the project explores relationships between smartphone characteristics, prices, customer attributes, ratings, and regional preferences.

The final outcome is a predictive model that estimates the marketing budget associated with a smartphone, along with analytical insights that can support data-driven marketing and product positioning decisions.

---

## 2. Project Objectives

The primary objectives of this project are:

- Examine and understand the structure and quality of the available datasets.
- Perform preliminary data quality checks, including missing values, duplicates, data types, and potential outliers.
- Establish a local MySQL database and integrate Python with MySQL using SQLAlchemy.
- Perform SQL-based exploratory data analysis across smartphone, user, and rating information.
- Investigate univariate, bivariate, and multivariate relationships within the data.
- Analyse smartphone pricing patterns and regional brand preferences.
- Consolidate the three datasets into a unified DataFrame.
- Calculate marketing budget as 30% of smartphone price.
- Perform feature selection using domain understanding and correlation analysis.
- Apply appropriate categorical encoding techniques.
- Develop a Linear Regression model to predict marketing budget.
- Evaluate model performance using R², Mean Squared Error (MSE), and Root Mean Squared Error (RMSE).
- Generate predictions using unseen test data.

---

## 3. Dataset Description

The project uses three Excel datasets.

| Dataset | Records | Attributes |
|---|---:|---:|
| `cellphones_data.xlsx` | 33 | 14 |
| `cellphone_users.xlsx` | 99 | 7 |
| `cellphones_ratings.xlsx` | 990 | 3 |

### 3.1 Smartphone Dataset

**File:** `cellphones_data.xlsx`

Contains information about smartphone models and their technical specifications.

Key attributes include:

- Cellphone ID
- Brand and model
- Operating system
- Internal memory and RAM
- Performance
- Main and selfie camera specifications
- Battery capacity
- Screen size and weight
- Smartphone price (INR)
- Release date

### 3.2 User Dataset

**File:** `cellphone_users.xlsx`

Contains demographic and occupational information about smartphone users.

Key attributes include:

- User ID and user name
- Region or city
- Salary (INR)
- Age
- Gender
- Occupation

### 3.3 Ratings Dataset

**File:** `cellphones_ratings.xlsx`

Contains user ratings associated with individual smartphone models.

Key attributes include:

- User ID
- Cellphone ID
- Rating

### 3.4 Dataset Relationships

The datasets are connected through common identifiers:

- `user_id` connects the user dataset with the ratings dataset.
- `cellphone_id` connects the ratings dataset with the smartphone dataset.

These relationships allow user information, smartphone specifications, and ratings to be analysed together.

**Note:** The available datasets do not contain a direct sales or purchase quantity field. Rating records are therefore used only as an interaction proxy in relevant regional analyses, not as verified sales transactions.

---

## 4. Technology Stack

The project is implemented using the following technologies and libraries.

| Technology | Purpose |
|---|---|
| Python | Primary programming language |
| Jupyter Notebook | Development and execution environment |
| MySQL | Relational database management |
| SQL | Data retrieval and analytical queries |
| SQLAlchemy | Python–MySQL database integration |
| PyMySQL | MySQL database connectivity |
| Pandas | Data manipulation and analysis |
| NumPy | Numerical operations |
| Matplotlib | Data visualization |
| Seaborn | Statistical visualization |
| Scikit-learn | Machine learning and model evaluation |
| OpenPyXL | Excel dataset loading |

---

## 5. Project Methodology

The project is divided into two major stages.

### Stage 1 – Data Preparation and Exploratory Data Analysis

Stage 1 establishes the foundation for the project by examining the datasets, integrating them with a relational database, and performing exploratory analysis.

**Data Inspection and Preliminary Preprocessing**

The three Excel datasets are loaded into Python and examined to understand their structure, attributes, and data types. Preliminary checks are performed to identify missing values, duplicate records, and potential outliers. These checks are conducted without applying unnecessary data treatment or modifying the original dataset values.

**MySQL Database Integration**

A custom MySQL database named `dsai_assignment` is created. The three datasets are uploaded into separate database tables. SQLAlchemy and PyMySQL are used to establish the Python–MySQL connection.

SQL queries are used to retrieve analytical data from the database. The retrieved results are then processed and visualized using Python.

**Exploratory Data Analysis**

The exploratory analysis is divided into three categories:

**Univariate Analysis**
- Smartphone price distribution.
- User salary distribution.
- Internal memory distribution.
- Smartphone weight distribution.
- Battery capacity distribution.

**Bivariate Analysis**
- User age versus smartphone price.
- Camera specifications versus smartphone price.
- Smartphone performance versus price.
- Operating system versus user ratings.
- Smartphone release date versus price.

**Multivariate Analysis**
- Regional smartphone brand preferences.
- Occupation-wise average smartphone price.
- Most frequently rated smartphone models by brand.
- Highest-rated smartphone models by brand.
- Regional brand preferences in relation to smartphone prices and user salaries.

Each analysis follows a SQL query, retrieval of the query result into a DataFrame, visualization, and interpretation.

### Stage 2 – Marketing Budget Prediction

Stage 2 extends the analysis into machine learning and predictive modelling.

**Dataset Consolidation**

The three datasets are merged using `user_id` and `cellphone_id`, resulting in a consolidated dataset containing 990 observations and 22 original attributes.

**Marketing Budget Calculation**

A new target variable named `Marketing_Budget` is introduced.

The marketing budget is calculated as:

`Marketing_Budget = Smartphone Price × 0.30`

This represents the 30% marketing budget allocation specified in the project requirements.

**Regional Price Analysis**

Average smartphone prices are analysed across different regions. Bar charts are used to compare regional pricing patterns. Since actual sales quantities are unavailable, rating counts are treated only as interaction counts.

**Feature Selection and Correlation Analysis**

Numerical correlation analysis is performed to examine relationships between available numerical attributes and the target variable.

Identifier columns such as `user_id`, `cellphone_id`, and `user_name` are excluded from model predictors.

The original `price(INR)` column is also excluded because the target variable is directly calculated from smartphone price. Including it would introduce target leakage.

Relevant smartphone, user, rating, and categorical features are retained for model development.

**Feature Engineering and Encoding**

The original release date is converted into a numerical `release_year` feature.

Categorical variables such as region, gender, occupation, brand, model, and operating system are converted into numerical representations using one-hot encoding.

**Train-Test Split**

The encoded dataset is divided into training and testing subsets using an 80:20 split.

- Training observations: 792
- Testing observations: 198

**Model Development**

A Linear Regression model from Scikit-learn is trained using the selected features to estimate `Marketing_Budget`.

**Model Evaluation**

The model is evaluated using three performance metrics:

- R² Score
- Mean Squared Error (MSE)
- Root Mean Squared Error (RMSE)

Actual and predicted marketing budget values are also compared through a prediction table and an Actual vs Predicted visualization.

---

## 6. Model Performance

The Linear Regression model produced the following results on the test dataset:

| Evaluation Metric | Result |
|---|---:|
| R² Score | 0.9958 |
| Mean Squared Error (MSE) | 523,604.08 |
| Root Mean Squared Error (RMSE) | ₹723.60 |

### Performance Interpretation

The model achieved an R² score of 0.9958, indicating that it explains approximately 99.58% of the variation in marketing budget values within the test dataset.

The RMSE of ₹723.60 represents the typical magnitude of prediction error in the same unit as the target variable.

The Actual vs Predicted visualization also demonstrates close agreement between observed and predicted marketing budget values.

These results indicate strong predictive performance on the available dataset. However, further validation with larger and more diverse datasets is necessary before applying the model to real-world marketing decisions.

---

## 7. Project Structure

The recommended project directory structure is:

```text
Smartphone-Market-Analysis/
│
├── Dataset_DSAI/
│   ├── cellphones_data.xlsx
│   ├── cellphone_users.xlsx
│   └── cellphones_ratings.xlsx
│
├── DSAI_MySQL_EDA.ipynb
│
├── README.md
│
└── requirements.txt
```

The Jupyter Notebook contains the complete implementation of Stage 1 and Stage 2, including database connectivity, SQL queries, exploratory analysis, visualizations, feature engineering, model development, evaluation, and predictions.

---

## 8. Installation and Setup

Follow these steps to run the project locally.

### Prerequisites

Ensure that the following are installed:

- Python 3.x
- MySQL Server
- Visual Studio Code or Jupyter Notebook
- Git (optional)

### Step 1 – Clone the Repository

```bash
git clone <repository-url>
```

Navigate into the project directory:

```bash
cd Smartphone-Market-Analysis
```

### Step 2 – Create a Virtual Environment

```bash
python -m venv venv
```

Activate the environment on Windows:

```bash
venv\Scripts\activate
```

### Step 3 – Install Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### Step 4 – Configure MySQL

Start your MySQL server and create the database:

```sql
CREATE DATABASE dsai_assignment;
```

Configure the database connection in the notebook using your local MySQL credentials.

For better credential security, use an environment variable rather than hardcoding the database password.

On Windows PowerShell:

```powershell
$env:MYSQL_PASSWORD="your_mysql_password"
```

Example Python connection:

```python
import os
from sqlalchemy import create_engine, URL

connection_url = URL.create(
    drivername="mysql+pymysql",
    username="root",
    password=os.getenv("MYSQL_PASSWORD"),
    host="localhost",
    port=3306,
    database="dsai_assignment"
)

engine = create_engine(connection_url)
```

### Step 5 – Prepare the Datasets

Place all three Excel files inside the `Dataset_DSAI` directory, maintaining the expected filenames and folder structure.

### Step 6 – Run the Notebook

Open the project in Visual Studio Code or Jupyter Notebook.

Open:

`DSAI_MySQL_EDA.ipynb`

Execute the notebook cells sequentially, beginning with the imports and database setup.

Ensure that the MySQL server is running and the required datasets are available before executing the notebook.

---

## 9. Requirements

The following packages are required:

```text
pandas
numpy
matplotlib
seaborn
sqlalchemy
pymysql
openpyxl
scikit-learn
jupyter
```

Install all dependencies using:

```bash
pip install pandas numpy matplotlib seaborn sqlalchemy pymysql openpyxl scikit-learn jupyter
```

---

## 10. Key Findings

The project provides several analytical observations:

- Smartphone prices vary across brands, models, and technical specifications.
- Internal memory, RAM, performance, and weight demonstrate comparatively stronger numerical relationships with marketing budget.
- Regional smartphone price patterns show moderate differences across the analysed cities.
- Brand preferences and average ratings vary across regions.
- Categorical features provide additional product and user information for predictive modelling.
- The Linear Regression model achieved strong test-set performance for marketing budget estimation.
- Actual and predicted marketing budget values showed close agreement on the test dataset.

These findings demonstrate the potential of combining database-driven analysis with machine learning to extract useful insights from structured smartphone market data.

---

## 11. Limitations and Future Enhancements

Although the project demonstrates a complete analytical and predictive workflow, certain limitations should be considered.

**Current Limitations**

- The datasets contain a relatively small number of distinct smartphone models.
- Actual sales and purchase quantities are not available.
- Rating records cannot be treated as verified sales transactions.
- Marketing budget is mathematically derived from smartphone price rather than collected from actual advertising expenditure.
- The model's evaluation results are specific to the available dataset and should not be interpreted as guaranteed real-world performance.

**Future Enhancements**

- Integrate actual smartphone sales and purchase transaction data.
- Include advertising expenditure and campaign performance.
- Incorporate competitor pricing and market share information.
- Explore customer purchase history and regional demand.
- Compare Linear Regression with other regression algorithms.
- Perform cross-validation and additional model diagnostics.
- Validate predictions using larger and more diverse datasets.
- Develop an interactive dashboard for exploring smartphone market insights and marketing budget estimates.

---

## 12. Conclusion

This project demonstrates the application of data science and machine learning techniques to smartphone market analysis and marketing budget prediction.

By integrating multiple datasets through MySQL, performing SQL-based exploratory analysis, engineering relevant features, and developing a Linear Regression model, the project establishes a complete workflow from raw data inspection to predictive analysis.

The results demonstrate how structured smartphone and user information can be transformed into meaningful analytical insights and used to estimate marketing budget requirements.

The project also provides a foundation for further exploration of pricing strategies, customer behaviour, regional market patterns, and data-driven marketing decisions.

---

## 13. Author

**Project:** Smartphone Market Analysis and Marketing Budget Prediction  
**Programme:** Master of Computer Applications (MCA)  
**Project Category:** Data Science and Machine Learning  
**Institution:** Jain Online (Deemed-to-be University)

---

*Developed as part of the MCA Applied Learning Project.*
