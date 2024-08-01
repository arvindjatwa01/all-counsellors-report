<?php
// $db = mysqli_connect('65.108.15.214', 'remotuser', '8hslSlJ.HHlP', 'class24_db');
// if (mysqli_connect_errno()) {
//     echo "Failed to connect to MySQL: " . mysqli_connect_error();
//     die;
// }


$db = mysqli_connect('localhost', 'root', '', 'class24');
if (mysqli_connect_errno()) {
    echo "Failed to connect to MySQL: " . mysqli_connect_error();
    die;
}

function enc_dec($str, $type = "enc", $time = '')
{
    $key = 'crypt';
    if ($type == 'enc') {
        $encrypted = base64_encode(time() . "|" . $str);
        return $encrypted;
    } else {
        $de = base64_decode($str);
        $dec = explode("|", $de);
        if (empty($time)) {
            if (isset($dec[1])) {
                return $dec[1];
            }
            return 0;
        } else {
            return array($dec[0], $dec[1]);
        }
    }
}

function getUserInfo($counslerId, $db)
{
    $query = "SELECT dlb_a_name AS Cname, dlb_salary AS salary
FROM wifi_admin
WHERE dlb_a_id = $counslerId;";
    $result = mysqli_query($db, $query);

    // Fetch data from the result set
    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    return (($data));
}

// get all the branch list
if ($_POST["isGetBranches"]) {
    $query = "SELECT dlb_b_id as branchId, dlb_b_name as branchName FROM `wifi_branches`";

    $result = mysqli_query($db, $query);

    // Fetch data from the result set
    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }

    if (empty($data)) {
        $apiSuccess = 0;
    } else {
        $apiSuccess = 1;
    }

    echo json_encode(array("apiSuccess" => $apiSuccess, "responsePacket" => $data));

}

// get last 6 months report chart
if ($_POST['isSixMonthsReport']) {

    $selectedBrnach = $_POST['selectedBranch'];
    $query = "SELECT 
    wcr.dlb_counsellor_id, 
    wa.dlb_a_name AS cName, 
    MONTH(lsm.first_day) AS month_number, 
    YEAR(lsm.first_day) AS year_number, 
    COUNT(wcr.dlb_created_date) AS records_count, 
    COALESCE(SUM(wcr.dlb_collectorate_revenue), 0) AS total_revenue, 
    COALESCE(MAX(wcr.dlb_collectorate_revenue), 0) AS highest_revenue, 
    COALESCE(MAX(wcr.dlb_salary), 0) AS dlb_salary, 
    COALESCE(GROUP_CONCAT(wcr.dlb_c_id ORDER BY wcr.dlb_c_id ASC), '') AS dlb_c_ids, 
    COALESCE(GROUP_CONCAT(wcr.dlb_a_id ORDER BY wcr.dlb_c_id ASC), '') AS dlb_a_ids, 
    COALESCE(GROUP_CONCAT(wcr.dlb_created_date ORDER BY wcr.dlb_c_id ASC), '') AS dlb_created_dates 
FROM (
    SELECT CURDATE() - INTERVAL 5 MONTH AS first_day 
    UNION ALL SELECT CURDATE() - INTERVAL 4 MONTH 
    UNION ALL SELECT CURDATE() - INTERVAL 3 MONTH 
    UNION ALL SELECT CURDATE() - INTERVAL 2 MONTH 
    UNION ALL SELECT CURDATE() - INTERVAL 1 MONTH 
    UNION ALL SELECT CURDATE()
) lsm 
LEFT JOIN wifi_counsellor_report wcr 
    ON DATE_FORMAT(wcr.dlb_revenue_date, '%Y-%m') = DATE_FORMAT(lsm.first_day, '%Y-%m') 
LEFT JOIN wifi_admin wa 
    ON wa.dlb_a_id = wcr.dlb_counsellor_id 
WHERE wa.dlb_branch_id = $selectedBrnach 
GROUP BY 
    wcr.dlb_counsellor_id, 
    YEAR(lsm.first_day), 
    MONTH(lsm.first_day) 
ORDER BY 
    YEAR(lsm.first_day), 
    MONTH(lsm.first_day), 
    wcr.dlb_counsellor_id;";

    $result = mysqli_query($db, $query);

    // Fetch data from the result set
    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    if (empty($data)) {
        $apiSuccess = 0;
    } else {
        $apiSuccess = 1;
    }
    // $userResponse = (getUserInfo($counslerId, $db));

    echo json_encode(array("apiSuccess" => $apiSuccess, "responsePacket" => $data, ));

    // echo json_encode(array("apiSuccess" => $apiSuccess, "responsePacket" => $data));
}

if ($_POST["isMonthSeleted"]) {
    $monthNumber = $_POST["monthNum"];
    $brnachId = $_POST['selectedBranch'];

    // $query = "SELECT WEEK(dlb_revenue_date) AS week_number, COUNT(*) AS records_count, SUM(dlb_collectorate_revenue) AS total_revenue, MAX(dlb_collectorate_revenue) AS highest_revenue, dlb_salary, GROUP_CONCAT(dlb_c_id ORDER BY dlb_c_id ASC) AS dlb_c_ids, GROUP_CONCAT(dlb_counsellor_id ORDER BY dlb_c_id ASC) AS dlb_a_ids, MAX(dlb_revenue_date) AS dlb_revenue_date FROM wifi_counsellor_report wcr LEFT JOIN wifi_admin wa 
    // ON wa.dlb_a_id = wcr.dlb_counsellor_id  WHERE dlb_branch_id = $brnachId AND MONTH(dlb_revenue_date) = $monthNumber AND YEAR(dlb_revenue_date) = YEAR(CURDATE()) GROUP BY WEEK(dlb_revenue_date) ORDER BY WEEK(dlb_revenue_date) ASC";

    $query = "SELECT wcr.dlb_counsellor_id, wa.dlb_a_name AS cName, MONTH(dlb_revenue_date) as 
month_number, WEEK(dlb_revenue_date) as week_number, SUM(dlb_collectorate_revenue) AS total_revenue, MAX(dlb_collectorate_revenue) AS highest_revenue, wcr.dlb_salary, MAX(dlb_revenue_date) AS dlb_revenue_date FROM `wifi_counsellor_report` wcr LEFT JOIN wifi_admin wa ON wa.dlb_a_id = wcr.dlb_counsellor_id WHERE MONTH(dlb_revenue_date) = $monthNumber AND wcr.dlb_branch_name = $brnachId AND YEAR(dlb_revenue_date) = YEAR(CURDATE()) GROUP BY WEEK(dlb_revenue_date) ORDER BY WEEK(dlb_revenue_date) ASC";
    $result = mysqli_query($db, $query);

    // Fetch data from the result set
    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    if (empty($data)) {
        $apiSuccess = 0;
    } else {
        $apiSuccess = 1;
    }

    echo json_encode(array("apiSuccess" => $apiSuccess, "responsePacket" => $data));
}

?>