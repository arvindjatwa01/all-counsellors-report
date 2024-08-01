<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Counslar Report</title>

    <!-- <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"> -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@10"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <div class="container">
        <div class="row my-2">
            <div class="col-md-3">
                <select class="form-control" name="b_name" id="b_name" onChange="handleShowBranchChart()">
                    <option value="">---Select Branch---</option>
                </select>
            </div>
            <div class="col-lg-12 col-sm-5 col-md-5 p-3 border-0 border-secondary rounded-3 shadow-lg filters">
                <div class="d-flex mb-2" id="clearFilter" style="justify-content: end">

                </div>
                <fieldset class="reset">
                    <legend class="reset" id="monthsFilter">Filter By Month <i class="fa-solid fa-eye"
                            onclick="handleShowHideMonthsName()" id="montheFilterEye"></i></legend>
                    <div class="row monthsClose" id="months"></div>
                </fieldset>
            </div>
            <div class="col-lg-12 my-3">
                <div class="col-lg-12 col-12 col-sm-12 align-items-center h-100">
                    <canvas id="myBarChart" class="barChart-fade-in mt-3"></canvas>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels"></script>
    <!-- <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script> -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <!-- <script src="./counsler.js"></script> -->
    <script src="./report.js"></script>
</body>

</html>