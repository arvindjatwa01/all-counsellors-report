const monthsArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Get the current date
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed in JavaScr

let canvaTagId = $("#myBarChart");
let reportChart;

// get all the branches list
const getAllBranches = () => {
  $.ajax({
    url: "ajaxReport.php",
    type: "POST",
    dataType: "json",
    data: {
      isMonthSeleted: 0,
      isSixMonthsReport: 0,
      isGetBranches: 1,
    },
    success: (response) => {
      if (response.apiSuccess === 1) {
        const result = response.responsePacket;
        const $select = $("#b_name");
        result.forEach(function (option) {
          const $option = $("<option></option>").val(option.branchId).text(option.branchName);
          $select.append($option);
        });
      }
    },
    error: () => {},
  });
};

// show all the months name for filtering
const showAllMonths = () => {
  let monthsList = "";
  for (let monthName of monthsArray) {
    monthsList =
      monthsList +
      `<div class="col-lg-2 col-md-3 col-4 d-flex justify-content-center align-items-center my-2"><button class="btn btn-primary mx-2 monthBtn" onclick="handleMonthFilterChart('${monthName}', event)">
         ${monthName.substr(0, 3)}</button></div>`;
  }
  $("#months").html(monthsList);
};

// ! ---------------- Grpah/Chart Working Flow Start ------------------- ! //

// ? Function to generate a random color
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// ? Function to get the last 6 months
const getLastSixMonths = () => {
  const months = [];
  for (let i = 0; i < 6; i++) {
    const month = (currentMonth - i + 12) % 12 || 12;
    const year = currentYear - (currentMonth - i <= 0 ? 1 : 0);
    months.unshift({ month, year });
  }
  return months;
};

// X Axis Months Label
const getXAxisMonthsLabel = (allMonthsReport, selectedMonth) => {
  if (allMonthsReport) {
    const currentMonthIndex = new Date().getMonth();
    let lastSixMonths = [];
    for (let i = 0; i < 6; i++) {
      let monthIndex = (currentMonthIndex - i + 12) % 12;
      lastSixMonths.push(monthsArray[monthIndex]);
    }
    return lastSixMonths.reverse();
  } else {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), selectedMonth, 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), selectedMonth + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const totalDaysInMonth = lastDayOfMonth.getDate();
    const totalWeeksInMonth = Math.ceil((totalDaysInMonth + firstDayOfWeek) / 7);
    const weeksArray = [];
    for (let i = 1; i <= totalWeeksInMonth; i++) {
      weeksArray.push(`Week ${i}`);
    }
    return weeksArray;
  }
};

// get week number
const getWeekNumber = (date) => {
  // Create a copy of the date object
  const currentDate = new Date(date.getTime());

  // Set the day of the week to Thursday (ISO week starts on Monday and week 1 contains January 4th)
  currentDate.setDate(currentDate.getDate() + 4 - (currentDate.getDay() || 7));

  // Calculate the first day of the year
  const yearStart = new Date(currentDate.getFullYear(), 0, 1);

  // Calculate the ISO week number
  const weekNumber = Math.ceil(((currentDate - yearStart) / 86400000 + 1) / 7);

  return weekNumber;
};

// get selected months weeks
const getWeeksInMonth = (year, month) => {
  // Create a date object for the first day of the month
  const firstDay = new Date(year, month - 1, 1);

  // Create a date object for the last day of the month
  const lastDay = new Date(year, month, 0);

  // Get the ISO week number for the first day of the month
  const firstWeekNumber = getWeekNumber(firstDay);

  // Get the ISO week number for the last day of the month
  const lastWeekNumber = getWeekNumber(lastDay);

  // Calculate the number of weeks
  return lastWeekNumber - firstWeekNumber + 1;
};

// Filter last 6 months recrods
const filterLastSixMonthsData = (data, lastSixMonths) => {
  // Filter data to include only records from the last 6 months
  const filteredData = data.filter((item) => {
    const itemYear = Number(item.year_number);
    const itemMonth = Number(item.month_number);
    // const itemWeek = Number(item.week_number);
    return lastSixMonths.some(({ month, year }) => itemMonth === month && itemYear === year);
  });
  return filteredData;
};

// Group data by counsler name
const responseGroupedData = (data, allMonthsReport) => {
  const lastSixMonths = getLastSixMonths();
  let _filteredData = [];
  if (allMonthsReport) {
    _filteredData = filterLastSixMonthsData(data, lastSixMonths);
  } else {
  }

  console.log("_filteredData :::: ", _filteredData);

  const groupedData = _filteredData.reduce((acc, item) => {
    if (!acc[item.cName]) {
      acc[item.cName] = {
        label: item.cName,
        data: Array(6).fill(0), // Initialize an array for 6 months with 0
      };
    }
    const monthIndex = lastSixMonths.findIndex(({ month, year }) => month === Number(item.month_number) && year === Number(item.year_number));
    if (monthIndex !== -1) {
      acc[item.cName].data[monthIndex] = Number(item.total_revenue);
    }
    return acc;
  }, {});
  return groupedData;
};

// get Per day Salary of the counsellors
const getPerDaySallary = (allMonthsReport, results) => {
  let perDaySalary = [];
  const today = new Date();
  const month = today.getMonth() + 1; // getMonth() is zero-based
  const day = today.getDate();
  if (allMonthsReport) {
    perDaySalary = results.map((item) => {
      if (item.month_number == month) {
        let perDay = Number(item.dlb_salary) / 30;
        return perDay * day;
      } else {
        return Number(item.dlb_salary);
      }
    });
  } else {
    //Weekly perDay salary count
    let date = results.map((item) => item.dlb_revenue_date);
    let dateSeprate = date[0].split("-");
    let numberOfWeeks = getWeeksInMonth(Number(dateSeprate[0]), Number(dateSeprate[1]));
    for (var i = 0; i < results.length; i++) {
      perDaySalary.push(Number(results[i].dlb_salary) / numberOfWeeks);
    }
  }
  return perDaySalary;
};

// get week number for selected month in current year
const getWeekNumbersInYear = (month, year) => {
  // Create a set to store unique week numbers
  let weekNumbers = new Set();

  // Iterate through each day of the month
  for (let day = 1; day <= new Date(year, month, 0).getDate(); day++) {
    let currentDate = new Date(year, month - 1, day);
    // Calculate the week number in the year
    let startOfYear = new Date(year, 0, 1);
    let diff = currentDate - startOfYear;
    let oneDay = 1000 * 60 * 60 * 24;
    let dayOfYear = Math.floor(diff / oneDay) + 1;
    let weekNumber = Math.ceil(dayOfYear / 7);
    weekNumbers.add(weekNumber);
  }

  return Array.from(weekNumbers);
};

// Line Chart
const showLineChart = (results = [], allMonthsReport = true, selectedMonth = null) => {
  if (reportChart) {
    reportChart.destroy();
  }
  if (results && results.length > 0) {
    // Branch Name
    const selectedBranch = $("#b_name option:selected").text();

    // get the max Revenue Amount
    const maxRevenueAmt = Math.max(...results.map((item) => Number(item.total_revenue)));

    // get the Per day salaries
    const perDaySalary = getPerDaySallary(allMonthsReport, results);

    // Convert grouped data to the desired format
    const groupedData = responseGroupedData(results, allMonthsReport);

    let _result = [];
    if (allMonthsReport) {
      _result = Object.values(groupedData).map((item) => {
        const color = getRandomColor();
        return {
          ...item,
          borderColor: color,
          backgroundColor: color,
        };
      });
    } else {
      // Aggregate data by cName
      const aggregatedData = results.reduce((acc, curr) => {
        const { cName, week_number, total_revenue } = curr;
        if (!acc[cName]) {
          acc[cName] = Array(5).fill(0); // Assuming there are 5 weeks in the data
        }
        const weekIndex = parseInt(week_number) - 26; // Adjust if week_number starts from a different number
        if (weekIndex >= 0 && weekIndex < acc[cName].length) {
          acc[cName][weekIndex] += parseInt(total_revenue);
        }
        return acc;
      }, {});

      // Convert to the desired format
      _result = Object.keys(aggregatedData).map((cName) => {
        const color = getRandomColor();
        return {
          label: cName,
          data: aggregatedData[cName],
          borderColor: color,
          backgroundColor: color,
        };
      });
    }

    const config = {
      type: "line",
      data: {
        labels: getXAxisMonthsLabel(allMonthsReport, selectedMonth),
        datasets: _result,
      },
      options: {
        responsive: true,
        interaction: {
          mode: "index",
          intersect: false,
        },
        stacked: false,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: `${selectedBranch} Counsellors Report Graph`,
          },
          datalabels: {
            anchor: "end",
            align: "top",
            // formatter: Math.round,
            formatter: (value, context) => {
              return `${Math.ceil(Number(value) / perDaySalary[context.dataIndex] || 0)}X`;
            },
            color: "black",
            font: {
              weight: "bold",
            },
          },
        },
        scales: {
          //   x: {
          //     display: true,
          //     title: {
          //       display: true,
          //     },
          //   },
          x: {
            title: {
              display: true,
              text: "Month/Year",
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Total Revenue",
            },
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return `${Math.ceil(value / 10000)}k`; // Format y-axis ticks as 'k'
              },
              stepSize: 100000,
              max: maxRevenueAmt, // Set the maximum value of y-axis to 10k
            },
          },
        },
      },
      plugins: [ChartDataLabels],
    };
    reportChart = new Chart(document.getElementById("myBarChart"), config);
  }
};

// ! ---------------- Grpah/Chart Working Flow Ended ------------------- ! //

// change brnach for showing graph
const handleShowBranchChart = (e) => {
  const selectedBranch = $("#b_name").val();
  if (selectedBranch) {
    $.ajax({
      url: "ajaxReport.php",
      type: "POST",
      dataType: "json",
      data: {
        isMonthSeleted: 0,
        selectedBranch: selectedBranch,
        isSixMonthsReport: 1,
        isGetBranches: 0,
      },
      success: (response) => {
        if (response.apiSuccess === 1) {
          const result = response.responsePacket;
          showLineChart(result, true);
        }
      },
      error: () => {},
    });
  } else {
    if (reportChart) {
      reportChart.destroy();
    }
  }
};

// get the selected months report
const handleMonthFilterChart = (monthName, e) => {
  const selectedBranch = $("#b_name").val();
  $("button").removeClass("btn-secondary");
  $(e.target).addClass("btn-secondary");
  $("#clearFilter").html('<div class="btn btn-primary" onclick="handleRemoveMonthFilter()">Clear Filter</div>');
  $.ajax({
    url: "ajaxReport.php",
    type: "POST",
    dataType: "json",
    data: {
      isMonthSeleted: 1,
      selectedBranch: selectedBranch,
      isSixMonthsReport: 0,
      monthNum: monthsArray.indexOf(monthName) + 1,
      isGetBranches: 0,
    },
    success: (response) => {
      if (response.apiSuccess === 1) {
        const result = response.responsePacket;
        showLineChart(result, false, monthsArray.indexOf(monthName) + 1);
      } else {
        showLineChart([], false, monthsArray.indexOf(monthName) + 1);
      }
    },
    error: () => {},
  });
};

// show hide the Months name
const handleShowHideMonthsName = () => {
  $(".monthsOpen, .monthsClose").toggleClass("monthsOpen monthsClose");
  if ($("#montheFilterEye").hasClass("fa-eye")) {
    $("#montheFilterEye").addClass("fa-eye-slash").removeClass("fa-eye");
  } else if ($("#montheFilterEye").hasClass("fa-eye-slash")) {
    $("#montheFilterEye").addClass("fa-eye").removeClass("fa-eye-slash");
  }
};

// Month Filter animations
const monthsFilterAnimation = (filterType = "byLabel") => {
  if (window.screen.width <= 768) {
    if (filterType === "byLabel") {
      $("#monthsFilter").on("click", handleShowHideMonthsName);
    } else if (filterType === "monthsFilter") {
      $(".monthsOpen, .monthsClose").toggleClass("monthsOpen monthsClose");
      $("#montheFilterEye").addClass("fa-eye").removeClass("fa-eye-slash");
    }
  }
};

// clear selected months Filter
const handleRemoveMonthFilter = () => {
  $("button").removeClass("btn-secondary");
  $("#clearFilter").html("");
  handleShowBranchChart();
  monthsFilterAnimation("monthsFilter");
};

$(document).ready(function () {
  getAllBranches();
  showAllMonths();
});
