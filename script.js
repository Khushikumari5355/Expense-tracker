const incomeInput = document.getElementById("income");
const savingTargetInput = document.getElementById("savingTarget");

const expenseInputs = document.querySelectorAll(".expense");

const analyzeBtn = document.getElementById("analyzeBtn");
const demoBtn = document.getElementById("demoBtn");

const results = document.getElementById("results");

const incomeResult = document.getElementById("incomeResult");
const expenseResult = document.getElementById("expenseResult");
const cutResult = document.getElementById("cutResult");
const savingResult = document.getElementById("savingResult");

const statusBox = document.getElementById("statusBox");
const statusTitle = document.getElementById("statusTitle");
const statusText = document.getElementById("statusText");

const budgetTable = document.getElementById("budgetTable");

const planIncome = document.getElementById("planIncome");
const planExpense = document.getElementById("planExpense");
const planSavings = document.getElementById("planSavings");

const savingPercentage = document.getElementById("savingPercentage");
const progress = document.getElementById("progress");

let currentChart = null;
let recommendedChart = null;


/* -----------------------------------
   CATEGORY SETTINGS
----------------------------------- */

const categories = {

    Housing: {
        target: 0.25,
        priority: 1,
        action: "Consider cheaper housing, refinancing or sharing options."
    },

    Food: {
        target: 0.10,
        priority: 3,
        action: "Reduce restaurant orders and plan weekly groceries."
    },

    Transportation: {
        target: 0.08,
        priority: 3,
        action: "Use public transport, carpooling or reduce unnecessary trips."
    },

    Utilities: {
        target: 0.07,
        priority: 1,
        action: "Reduce electricity, internet and subscription costs."
    },

    Healthcare: {
        target: 0.05,
        priority: 1,
        action: "Keep essential healthcare spending protected."
    },

    Entertainment: {
        target: 0.05,
        priority: 4,
        action: "Reduce subscriptions, outings and unnecessary entertainment."
    },

    Shopping: {
        target: 0.08,
        priority: 5,
        action: "Avoid impulse purchases and set a monthly shopping limit."
    },

    Other: {
        target: 0.07,
        priority: 4,
        action: "Review miscellaneous expenses and remove unnecessary spending."
    }
};


/* -----------------------------------
   FORMAT MONEY
----------------------------------- */

function money(value) {

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    }).format(value);

}


/* -----------------------------------
   GET EXPENSES
----------------------------------- */

function getExpenses() {

    const expenses = {};

    expenseInputs.forEach(input => {

        const category = input.dataset.category;

        expenses[category] = Number(input.value) || 0;

    });

    return expenses;
}


/* -----------------------------------
   ANALYZE
----------------------------------- */

function analyzeExpenses() {

    const income = Number(incomeInput.value);

    const savingPercent = Number(savingTargetInput.value) || 0;

    if (!income || income <= 0) {

        alert("Please enter your monthly income.");

        return;

    }


    const expenses = getExpenses();

    let totalExpenses = 0;

    Object.values(expenses).forEach(value => {

        totalExpenses += value;

    });


    /*
        Example:

        Income = $30,000
        Saving Target = 20%

        Target Savings = $6,000

        Maximum spending = $24,000
    */

    const targetSavings = income * savingPercent / 100;

    const maximumSpending = income - targetSavings;


    /*
        If current expenses are greater than
        maximum recommended spending,
        calculate required reduction.
    */

    let requiredCut = Math.max(
        0,
        totalExpenses - maximumSpending
    );


    /*
        Calculate initial recommended amounts
        using category target percentages.
    */

    let recommended = {};

    Object.keys(expenses).forEach(category => {

        const categoryLimit =
            income * categories[category].target;

        recommended[category] =
            Math.min(expenses[category], categoryLimit);

    });


    /*
        Make sure recommended expenses don't exceed
        maximum spending.

        If they exceed the limit, reduce flexible
        categories first.
    */

    let recommendedTotal =
        Object.values(recommended)
        .reduce((sum, value) => sum + value, 0);


    if (recommendedTotal > maximumSpending) {

        let extraReduction =
            recommendedTotal - maximumSpending;


        const flexibleCategories =
            Object.keys(categories)
            .sort((a, b) =>
                categories[b].priority -
                categories[a].priority
            );


        flexibleCategories.forEach(category => {

            if (extraReduction <= 0) return;

            const reduction =
                Math.min(
                    recommended[category],
                    extraReduction
                );

            recommended[category] -= reduction;

            extraReduction -= reduction;

        });


        recommendedTotal =
            Object.values(recommended)
            .reduce((sum, value) => sum + value, 0);

    }


    /*
        If current expenses are already below
        the maximum spending limit, don't force
        unnecessary cuts.
    */

    if (totalExpenses <= maximumSpending) {

        recommended = {...expenses};

        recommendedTotal = totalExpenses;

    }


    /*
        Actual savings after recommended spending.
    */

    let actualSavings =
        income - recommendedTotal;


    /*
        Total amount reduced from current spending.
    */

    let totalCut =
        Math.max(0, totalExpenses - recommendedTotal);


    showResults(
        income,
        totalExpenses,
        recommended,
        totalCut,
        actualSavings,
        savingPercent
    );


    saveData();

}


/* -----------------------------------
   SHOW RESULTS
----------------------------------- */

function showResults(
    income,
    totalExpenses,
    recommended,
    totalCut,
    actualSavings,
    savingPercent
) {

    results.classList.remove("hidden");


    incomeResult.textContent = money(income);

    expenseResult.textContent =
        money(totalExpenses);

    cutResult.textContent =
        money(totalCut);

    savingResult.textContent =
        money(actualSavings);


    /*
        Status message
    */

    statusBox.className = "status-box";


    if (totalExpenses > income) {

        statusBox.classList.add("status-danger");

        statusTitle.textContent =
            "⚠️ You are spending more than your income";

        statusText.textContent =
            `You currently spend ${money(totalExpenses)} while earning ${money(income)}. ` +
            `Your monthly deficit is ${money(totalExpenses - income)}. ` +
            `The plan below shows where you can reduce expenses.`;

    }

    else if (actualSavings >= income * savingPercent / 100) {

        statusBox.classList.add("status-success");

        statusTitle.textContent =
            "✅ Your budget is on track";

        statusText.textContent =
            `Your recommended plan allows you to save ${money(actualSavings)} every month.`;

    }

    else {

        statusBox.classList.add("status-warning");

        statusTitle.textContent =
            "💡 You can improve your savings";

        statusText.textContent =
            `Your current spending can be optimized to create more room for savings.`;

    }


    createBudgetTable(recommended);

    createCharts(recommended);

    planIncome.textContent =
        money(income);

    const recommendedTotal =
        Object.values(recommended)
        .reduce((sum, value) => sum + value, 0);

    planExpense.textContent =
        money(recommendedTotal);

    planSavings.textContent =
        money(actualSavings);


    const percent =
        income > 0
            ? (actualSavings / income) * 100
            : 0;

    savingPercentage.textContent =
        `${percent.toFixed(1)}%`;

    progress.style.width =
        `${Math.min(percent, 100)}%`;


    /*
        Scroll to results
    */

    results.scrollIntoView({
        behavior: "smooth"
    });

}


/* -----------------------------------
   CREATE BUDGET TABLE
----------------------------------- */

function createBudgetTable(recommended) {

    const expenses = getExpenses();

    budgetTable.innerHTML = "";


    Object.keys(expenses).forEach(category => {

        const current = expenses[category];

        const suggested = recommended[category];

        const cut =
            Math.max(0, current - suggested);


        const row =
            document.createElement("tr");


        let cutClass =
            cut > 0
                ? "cut"
                : "no-cut";


        let cutText =
            cut > 0
                ? `-${money(cut)}`
                : "No cut needed";


        row.innerHTML = `

            <td>
                <strong>${category}</strong>
            </td>

            <td>
                ${money(current)}
            </td>

            <td>
                ${money(suggested)}
            </td>

            <td class="${cutClass}">
                ${cutText}
            </td>

            <td class="action">
                ${cut > 0
                    ? categories[category].action
                    : "Your current spending is within the suggested limit."
                }
            </td>

        `;


        budgetTable.appendChild(row);

    });

}


/* -----------------------------------
   CHARTS
----------------------------------- */

function createCharts(recommended) {

    const expenses = getExpenses();

    const labels =
        Object.keys(expenses);


    const currentValues =
        Object.values(expenses);


    const recommendedValues =
        Object.values(recommended);


    /*
        Destroy old charts
    */

    if (currentChart) {

        currentChart.destroy();

    }

    if (recommendedChart) {

        recommendedChart.destroy();

    }


    /*
        Current spending doughnut
    */

    const currentCanvas =
        document.getElementById("currentChart");


    currentChart =
        new Chart(currentCanvas, {

            type: "doughnut",

            data: {

                labels: labels,

                datasets: [{

                    data: currentValues,

                    borderWidth: 2

                }]

            },

            options: {

                responsive: true,

                plugins: {

                    legend: {

                        position: "bottom"

                    }

                }

            }

        });


    /*
        Current vs Recommended
    */

    const recommendedCanvas =
        document.getElementById(
            "recommendedChart"
        );


    recommendedChart =
        new Chart(recommendedCanvas, {

            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {

                        label: "Current",

                        data: currentValues

                    },

                    {

                        label: "Recommended",

                        data: recommendedValues

                    }

                ]

            },

            options: {

                responsive: true,

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback: function(value) {

                                return "$" +
                                    value.toLocaleString();

                            }

                        }

                    }

                }

            }

        });

}


/* -----------------------------------
   DEMO DATA
----------------------------------- */

demoBtn.addEventListener("click", function() {

    incomeInput.value = 30000;

    savingTargetInput.value = 20;


    const demoExpenses = {

        Housing: 12000,

        Food: 6000,

        Transportation: 5000,

        Utilities: 3000,

        Healthcare: 2000,

        Entertainment: 4000,

        Shopping: 7000,

        Other: 6000

    };


    expenseInputs.forEach(input => {

        const category =
            input.dataset.category;

        input.value =
            demoExpenses[category] || 0;

    });


    analyzeExpenses();

});


/* -----------------------------------
   ANALYZE BUTTON
----------------------------------- */

analyzeBtn.addEventListener(
    "click",
    analyzeExpenses
);


/* -----------------------------------
   LOCAL STORAGE
----------------------------------- */

function saveData() {

    const data = {

        income: incomeInput.value,

        savingTarget:
            savingTargetInput.value,

        expenses: getExpenses()

    };


    localStorage.setItem(
        "smartExpenseAdvisor",
        JSON.stringify(data)
    );

}


function loadData() {

    const saved =
        localStorage.getItem(
            "smartExpenseAdvisor"
        );


    if (!saved) return;


    const data =
        JSON.parse(saved);


    incomeInput.value =
        data.income || "";


    savingTargetInput.value =
        data.savingTarget || 20;


    if (data.expenses) {

        expenseInputs.forEach(input => {

            const category =
                input.dataset.category;

            input.value =
                data.expenses[category] || 0;

        });

    }

}


/* -----------------------------------
   LOAD SAVED DATA
----------------------------------- */

window.addEventListener(
    "DOMContentLoaded",
    loadData
);