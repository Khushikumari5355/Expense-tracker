const incomeInput =
    document.getElementById("income");

const savingTargetInput =
    document.getElementById("savingTarget");

const expenseInputs =
    document.querySelectorAll(".expense");

const analyzeBtn =
    document.getElementById("analyzeBtn");

const exampleBtn =
    document.getElementById("exampleBtn");

const freshNotice =
    document.getElementById("freshNotice");

const freshBtn =
    document.getElementById("freshBtn");

const recommendationSection =
    document.getElementById(
        "recommendationSection"
    );

const results =
    document.getElementById("results");


let currentChart = null;

let recommendedChart = null;

/* CATEGORY WEIGHTS*/

const categoryWeights = {

    Housing: 25,

    Food: 12.5,

    Transportation: 10,

    Utilities: 7.5,

    Healthcare: 7.5,

    Entertainment: 5,

    Shopping: 7.5,

    Other: 5

};


/*ACTIONS*/

const actions = {

    Housing:
        "Try to keep rent within the recommended limit.",

    Food:
        "Reduce restaurant orders and plan your groceries.",

    Transportation:
        "Reduce unnecessary trips and transport costs.",

    Utilities:
        "Reduce electricity, bills and unnecessary subscriptions.",

    Healthcare:
        "Keep essential healthcare expenses protected.",

    Entertainment:
        "Reduce unnecessary entertainment and subscriptions.",

    Shopping:
        "Avoid impulse shopping and unnecessary purchases.",

    Other:
        "Review miscellaneous expenses and remove unnecessary costs."

};


/* RUPEE FORMAT */

function money(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(value);

}


/* GET EXPENSES */

function getExpenses() {

    const expenses = {};


    expenseInputs.forEach(input => {

        const category =
            input.dataset.category;

        expenses[category] =
            Number(input.value) || 0;

    });


    return expenses;

}


/*CLEAR CURRENT EXPENSE */

function clearCurrentExpenses() {

    expenseInputs.forEach(input => {

        input.value = "";

    });


    /*
        Hide old analysis.
    */

    results.classList.add(
        "hidden"
    );


    /*
        Destroy old charts.
    */

    if (currentChart) {

        currentChart.destroy();

        currentChart = null;

    }


    if (recommendedChart) {

        recommendedChart.destroy();

        recommendedChart = null;

    }


    /*
        Show fresh expense option.
    */

    freshNotice.classList.remove(
        "hidden"
    );

}


/*START FRESH BUTTON*/

freshBtn.addEventListener(
    "click",
    function() {

        /*
            Expenses are already cleared.
            Just hide the notice and focus
            on first expense field.
        */

        freshNotice.classList.add(
            "hidden"
        );


        expenseInputs[0].focus();

    }
);


/* CREATE RECOMMENDED BUDGET*/

function createRecommendedBudget(
    income,
    savingPercent
) {

    const targetSavings =
        income *
        savingPercent /
        100;


    const maximumSpending =
        income -
        targetSavings;


    let totalWeight = 0;


    Object.values(categoryWeights)
        .forEach(weight => {

            totalWeight += weight;

        });


    const recommended = {};


    Object.keys(categoryWeights)
        .forEach(category => {

            const share =
                categoryWeights[category] /
                totalWeight;


            recommended[category] =
                maximumSpending *
                share;

        });


    return {

        recommended,

        maximumSpending,

        targetSavings

    };

}


/*SHOW RECOMMENDED BUDGET*/

function showRecommendedBudget(
    recommended,
    maximumSpending,
    targetSavings
) {

    document.getElementById(
        "recHousing"
    ).textContent =
        money(recommended.Housing);


    document.getElementById(
        "recFood"
    ).textContent =
        money(recommended.Food);


    document.getElementById(
        "recTransport"
    ).textContent =
        money(recommended.Transportation);


    document.getElementById(
        "recUtilities"
    ).textContent =
        money(recommended.Utilities);


    document.getElementById(
        "recHealthcare"
    ).textContent =
        money(recommended.Healthcare);


    document.getElementById(
        "recEntertainment"
    ).textContent =
        money(recommended.Entertainment);


    document.getElementById(
        "recShopping"
    ).textContent =
        money(recommended.Shopping);


    document.getElementById(
        "recOther"
    ).textContent =
        money(recommended.Other);


    document.getElementById(
        "maxSpending"
    ).textContent =
        money(maximumSpending);


    document.getElementById(
        "targetSavings"
    ).textContent =
        money(targetSavings);


    recommendationSection.classList.remove(
        "hidden"
    );

}


/*UPDATE RECOMMENDATION WHEN
   INCOME / SAVING CHANGES*/

function updateRecommendation() {

    const income =
        Number(incomeInput.value);


    const savingPercent =
        Number(savingTargetInput.value);


    if (
        income > 0 &&
        savingTargetInput.value !== "" &&
        savingPercent >= 0 &&
        savingPercent <= 90
    ) {

        const budget =
            createRecommendedBudget(
                income,
                savingPercent
            );


        showRecommendedBudget(

            budget.recommended,

            budget.maximumSpending,

            budget.targetSavings

        );

    }

}


/*INCOME CHANGE*/

incomeInput.addEventListener(
    "input",
    function() {

        /*
            If expenses already exist,
            income change means start fresh.
        */

        const hasExpenses =
            Array.from(expenseInputs)
                .some(
                    input =>
                        input.value !== ""
                );


        if (hasExpenses) {

            clearCurrentExpenses();

        }


        /*
            Update recommended budget.
        */

        updateRecommendation();

    }
);


/* 
   SAVING TARGET CHANGE
 */

savingTargetInput.addEventListener(
    "input",
    function() {

        const hasExpenses =
            Array.from(expenseInputs)
                .some(
                    input =>
                        input.value !== ""
                );


        if (hasExpenses) {

            clearCurrentExpenses();

        }


        /*
            Update recommended budget.
        */

        updateRecommendation();

    }
);


/* 
   MAIN ANALYSIS
 */

function analyzeExpenses() {

    const income =
        Number(incomeInput.value);


    const savingPercent =
        Number(savingTargetInput.value);


    /* Income validation */

    if (!income || income <= 0) {

        alert(
            "Please enter your monthly income."
        );

        return;

    }


    /* Saving validation */

    if (
        savingTargetInput.value === ""
    ) {

        alert(
            "Please enter your saving target."
        );

        return;

    }


    if (
        savingPercent < 0 ||
        savingPercent > 90
    ) {

        alert(
            "Saving target should be between 0% and 90%."
        );

        return;

    }


    /* Create budget */

    const budget =
        createRecommendedBudget(
            income,
            savingPercent
        );


    const recommended =
        budget.recommended;


    const maximumSpending =
        budget.maximumSpending;


    const targetSavings =
        budget.targetSavings;


    /* Show recommendation */

    showRecommendedBudget(

        recommended,

        maximumSpending,

        targetSavings

    );


    /* Get expenses */

    const expenses =
        getExpenses();


    let totalExpenses = 0;


    Object.values(expenses)
        .forEach(value => {

            totalExpenses += value;

        });


    /* Calculate cuts */

    let totalCut = 0;


    Object.keys(expenses)
        .forEach(category => {

            if (
                expenses[category] >
                recommended[category]
            ) {

                totalCut +=
                    expenses[category] -
                    recommended[category];

            }

        });


    showResults(

        income,

        totalExpenses,

        recommended,

        totalCut,

        targetSavings,

        savingPercent

    );


    /*
        Analysis is done, so
        fresh notice can disappear.
    */

    freshNotice.classList.add(
        "hidden"
    );

}


/*SHOW RESULTS
 */

function showResults(

    income,
    totalExpenses,
    recommended,
    totalCut,
    targetSavings,
    savingPercent

) {

    results.classList.remove(
        "hidden"
    );


    document.getElementById(
        "incomeResult"
    ).textContent =
        money(income);


    document.getElementById(
        "expenseResult"
    ).textContent =
        money(totalExpenses);


    document.getElementById(
        "cutResult"
    ).textContent =
        money(totalCut);


    document.getElementById(
        "savingResult"
    ).textContent =
        money(targetSavings);


    const statusBox =
        document.getElementById(
            "statusBox"
        );


    const statusTitle =
        document.getElementById(
            "statusTitle"
        );


    const statusText =
        document.getElementById(
            "statusText"
        );


    statusBox.className =
        "status-box";


    /* No expenses */

    if (totalExpenses === 0) {

        statusTitle.textContent =
            "Your personalized budget is ready";


        statusText.textContent =
            `Your recommended spending limit is ${money(
                income - targetSavings
            )} and your target savings is ${money(
                targetSavings
            )}. Enter your current expenses to see where you can reduce spending.`;

    }


    /* Spending higher than income */

    else if (totalExpenses > income) {

        statusBox.classList.add(
            "status-danger"
        );


        const extra =
            totalExpenses - income;


        statusTitle.textContent =
            "Your expenses are higher than your income";


        statusText.textContent =
            `You are spending ${money(
                extra
            )} more than your monthly income. Reduce unnecessary expenses.`;

    }


    /* Spending above recommended */

    else if (
        totalExpenses >
        income - targetSavings
    ) {

        statusBox.classList.add(
            "status-warning"
        );


        const extra =
            totalExpenses -
            (income - targetSavings);


        statusTitle.textContent =
            "Your expenses can be reduced";


        statusText.textContent =
            `You are spending approximately ${money(
                extra
            )} above your recommended spending limit. Check the reduction plan below.`;

    }


    /* Good */

    else {

        statusBox.classList.add(
            "status-success"
        );


        statusTitle.textContent =
            "Your spending is within the recommended budget";


        statusText.textContent =
            `Good job! Your current spending is within your recommended limit. Your target savings is ${money(
                targetSavings
            )} per month.`;

    }


    createBudgetTable(
        recommended
    );


    createCharts(
        recommended
    );


    document.getElementById(
        "planIncome"
    ).textContent =
        money(income);


    document.getElementById(
        "planExpense"
    ).textContent =
        money(
            income - targetSavings
        );


    document.getElementById(
        "planSavings"
    ).textContent =
        money(targetSavings);


    document.getElementById(
        "savingPercentage"
    ).textContent =
        `${savingPercent}%`;


    document.getElementById(
        "progress"
    ).style.width =
        `${savingPercent}%`;


    results.scrollIntoView({
        behavior: "smooth"
    });

}


/*
   CREATE REDUCTION TABLE
 */

function createBudgetTable(
    recommended
) {

    const expenses =
        getExpenses();


    const table =
        document.getElementById(
            "budgetTable"
        );


    table.innerHTML = "";


    Object.keys(expenses)
        .forEach(category => {

            const current =
                expenses[category];


            const suggested =
                recommended[category];


            const cut =
                Math.max(
                    0,
                    current - suggested
                );


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    <strong>
                        ${category}
                    </strong>
                </td>

                <td>
                    ${money(current)}
                </td>

                <td>
                    ${money(suggested)}
                </td>

                <td class="${
                    cut > 0
                        ? "cut"
                        : "no-cut"
                }">

                    ${
                        cut > 0
                            ? money(cut)
                            : "₹0"
                    }

                </td>

                <td class="action">

                    ${
                        cut > 0
                            ? actions[category]
                            : "Spending is within the recommended limit."
                    }

                </td>

            `;


            table.appendChild(row);

        });

}


/* 
   CREATE CHARTS
 */

function createCharts(
    recommended
) {

    const expenses =
        getExpenses();


    const labels =
        Object.keys(expenses);


    const currentValues =
        Object.values(expenses);


    const recommendedValues =
        Object.values(recommended);


    /* Destroy old charts */

    if (currentChart) {

        currentChart.destroy();

    }


    if (recommendedChart) {

        recommendedChart.destroy();

    }


    /* PIE CHART */

    const pieLabels = [];

    const pieValues = [];


    labels.forEach(
        (category, index) => {

            if (
                currentValues[index] > 0
            ) {

                pieLabels.push(
                    category
                );

                pieValues.push(
                    currentValues[index]
                );

            }

        }
    );


    /*
        If no expenses are entered,
        don't create a fake expense.
    */

    if (pieValues.length === 0) {

        pieLabels.push(
            "No expenses entered"
        );

        pieValues.push(1);

    }


    currentChart =
        new Chart(

            document.getElementById(
                "currentChart"
            ),

            {

                type: "pie",

                data: {

                    labels: pieLabels,

                    datasets: [{

                        data: pieValues,

                        borderWidth: 2

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "bottom"

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function(context) {

                                        if (
                                            pieLabels[0] ===
                                            "No expenses entered"
                                        ) {

                                            return " No expenses entered";

                                        }


                                        return " " +
                                            money(
                                                context.raw
                                            );

                                    }

                            }

                        }

                    }

                }

            }

        );


    /* BAR CHART */

    recommendedChart =
        new Chart(

            document.getElementById(
                "recommendedChart"
            ),

            {

                type: "bar",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                "Current",

                            data:
                                currentValues

                        },

                        {

                            label:
                                "Recommended",

                            data:
                                recommendedValues

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    function(value) {

                                        return "₹" +
                                            value.toLocaleString(
                                                "en-IN"
                                            );

                                    }

                            }

                        }

                    }

                }

            }

        );

}


/* ANALYZE BUTTON */

analyzeBtn.addEventListener(
    "click",
    analyzeExpenses
);


/*
   ₹30,000 EXAMPLE
 */

exampleBtn.addEventListener(
    "click",
    function() {

        /*
            Example is loaded ONLY
            when this button is clicked.
        */

        incomeInput.value = 30000;

        savingTargetInput.value = 50;


        document.querySelector(
            '[data-category="Housing"]'
        ).value = 6000;


        document.querySelector(
            '[data-category="Food"]'
        ).value = 4000;


        document.querySelector(
            '[data-category="Transportation"]'
        ).value = 2500;


        document.querySelector(
            '[data-category="Utilities"]'
        ).value = 1500;


        document.querySelector(
            '[data-category="Healthcare"]'
        ).value = 1000;


        document.querySelector(
            '[data-category="Entertainment"]'
        ).value = 1500;


        document.querySelector(
            '[data-category="Shopping"]'
        ).value = 2000;


        document.querySelector(
            '[data-category="Other"]'
        ).value = 1000;


        analyzeExpenses();

    }
);


/*
   INITIAL PAGE
 */

window.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
            EVERYTHING BLANK
        */

        incomeInput.value = "";

        savingTargetInput.value = "";


        expenseInputs.forEach(
            input => {

                input.value = "";

            }
        );


        recommendationSection
            .classList.add("hidden");


        results
            .classList.add("hidden");


        freshNotice
            .classList.add("hidden");

    }
);
