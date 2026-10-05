// ============================================================
// แดชบอร์ดอายุความนิยมของเพลง
// ระบบแสดงผลและวิเคราะห์ข้อมูลเพลง
// ============================================================


// ============================================================
// 1. ตัวแปรหลัก
// ============================================================

let songData = [];

let scatterChart = null;
let genreChart = null;
let labelChart = null;
let correlationChart = null;


// ============================================================
// 2. ตำแหน่งไฟล์ข้อมูล
// ============================================================
//
// โครงสร้างไฟล์:
//
// song-longevity-dashboard/
// │
// ├── index.html
// ├── app.js
// ├── style.css
// └── song_longevity.csv
//
// ดังนั้นไฟล์ CSV อยู่โฟลเดอร์เดียวกับ app.js
// ============================================================

const DATA_PATH = "./song_longevity.csv";


// ============================================================
// 3. เริ่มต้นระบบ
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("เริ่มต้นระบบแดชบอร์ดอายุความนิยมของเพลง");

    setupFilters();

    loadData();

});


// ============================================================
// 4. โหลดข้อมูล CSV
// ============================================================

async function loadData() {

    try {

        console.log("กำลังโหลดข้อมูลจาก:");
        console.log(DATA_PATH);


        const response = await fetch(DATA_PATH);


        if (!response.ok) {

            throw new Error(
                "ไม่สามารถโหลดไฟล์ข้อมูลได้ " +
                "(รหัส HTTP: " +
                response.status +
                ")"
            );

        }


        const csvText =
            await response.text();


        console.log(
            "โหลดไฟล์ CSV สำเร็จ"
        );


        // แปลง CSV เป็นข้อมูล JavaScript

        songData =
            parseCSV(csvText);


        console.log(
            "จำนวนข้อมูลทั้งหมด:",
            songData.length
        );


        // ตรวจสอบว่ามีข้อมูลหรือไม่

        if (
            songData.length === 0
        ) {

            throw new Error(
                "ไม่พบข้อมูลในไฟล์ song_longevity.csv"
            );

        }


        // แสดงชื่อคอลัมน์ใน Console

        console.log(
            "คอลัมน์ที่พบ:",
            Object.keys(songData[0])
        );


        // สร้างตัวเลือกตัวกรอง

        populateFilters();


        // แสดง Dashboard

        updateDashboard(
            songData
        );


    }

    catch (error) {

        console.error(
            "เกิดข้อผิดพลาด:",
            error
        );


        showDataError(
            error.message
        );

    }

}


// ============================================================
// 5. แปลงข้อมูล CSV
// ============================================================

function parseCSV(text) {

    const lines =
        text
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .split("\n");


    if (
        lines.length < 2
    ) {

        return [];

    }


    // อ่านหัวตาราง

    const headers =
        parseCSVLine(lines[0])
            .map(function (header) {

                return header
                    .replace(/^\uFEFF/, "")
                    .trim();

            });


    const data = [];


    // อ่านข้อมูลแต่ละแถว

    for (
        let i = 1;
        i < lines.length;
        i++
    ) {

        if (
            lines[i].trim() === ""
        ) {

            continue;

        }


        const values =
            parseCSVLine(
                lines[i]
            );


        const row = {};


        headers.forEach(
            function (
                header,
                index
            ) {

                row[header] =
                    values[index] !== undefined
                        ? values[index].trim()
                        : "";

            }
        );


        data.push(row);

    }


    return data;

}


// ============================================================
// 6. อ่านข้อมูลแต่ละบรรทัดของ CSV
// ============================================================

function parseCSVLine(line) {

    const result = [];

    let current = "";

    let insideQuotes = false;


    for (
        let i = 0;
        i < line.length;
        i++
    ) {

        const character =
            line[i];


        // ตรวจสอบเครื่องหมาย "

        if (
            character === '"'
        ) {

            if (
                insideQuotes &&
                line[i + 1] === '"'
            ) {

                current += '"';

                i++;

            }

            else {

                insideQuotes =
                    !insideQuotes;

            }

        }


        // ถ้าเป็น comma และไม่ได้อยู่ในข้อความที่ครอบด้วย "

        else if (
            character === "," &&
            !insideQuotes
        ) {

            result.push(
                current
            );

            current = "";

        }


        else {

            current +=
                character;

        }

    }


    result.push(
        current
    );


    return result;

}


// ============================================================
// 7. แปลงข้อมูลเป็นตัวเลข
// ============================================================

function toNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }


    const number =
        Number(
            String(value)
                .replace(/,/g, "")
                .trim()
        );


    if (
        Number.isFinite(number)
    ) {

        return number;

    }


    return 0;

}


// ============================================================
// 8. จัดรูปแบบตัวเลข
// ============================================================

function formatNumber(value) {

    return new Intl.NumberFormat(
        "en-US"
    ).format(
        Number(value) || 0
    );

}


// ============================================================
// 9. เปลี่ยนข้อความบนหน้าเว็บ
// ============================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// ============================================================
// 10. ตั้งค่าตัวกรอง
// ============================================================

function setupFilters() {

    const genreFilter =
        document.getElementById(
            "genreFilter"
        );


    const labelFilter =
        document.getElementById(
            "labelFilter"
        );


    const hitFilter =
        document.getElementById(
            "hitFilter"
        );


    const resetButton =
        document.getElementById(
            "resetBtn"
        );


    // ตัวกรองประเภทเพลง

    if (genreFilter) {

        genreFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    // ตัวกรองระดับค่ายเพลง

    if (labelFilter) {

        labelFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    // ตัวกรองเพลงฮิต

    if (hitFilter) {

        hitFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    // ปุ่มรีเซ็ต

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetFilters
        );

    }

}


// ============================================================
// 11. สร้างตัวเลือกประเภทเพลงและระดับค่ายเพลง
// ============================================================

function populateFilters() {

    populateSelect(
        "genreFilter",
        "genre",
        "ทุกประเภทเพลง"
    );


    populateSelect(
        "labelFilter",
        "label_tier",
        "ทุกระดับค่ายเพลง"
    );

}


// ============================================================
// 12. สร้างรายการใน Select
// ============================================================

function populateSelect(
    elementId,
    columnName,
    defaultText
) {

    const select =
        document.getElementById(
            elementId
        );


    if (!select) {

        return;

    }


    const values = [];


    songData.forEach(
        function (row) {

            const value =
                row[columnName];


            if (
                value !== undefined &&
                value !== null &&
                value !== "" &&
                !values.includes(value)
            ) {

                values.push(value);

            }

        }
    );


    // เรียงข้อมูลตามตัวอักษร

    values.sort(
        function (a, b) {

            return String(a)
                .localeCompare(
                    String(b)
                );

        }
    );


    // ล้างข้อมูลเดิม

    select.innerHTML = "";


    // ตัวเลือกเริ่มต้น

    const defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value =
        "all";


    defaultOption.textContent =
        defaultText;


    select.appendChild(
        defaultOption
    );


    // เพิ่มตัวเลือกจากข้อมูลจริง

    values.forEach(
        function (value) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                value;


            option.textContent =
                value;


            select.appendChild(
                option
            );

        }
    );

}


// ============================================================
// 13. กรองข้อมูล
// ============================================================

function applyFilters() {

    const genreFilter =
        document.getElementById(
            "genreFilter"
        );


    const labelFilter =
        document.getElementById(
            "labelFilter"
        );


    const hitFilter =
        document.getElementById(
            "hitFilter"
        );


    const selectedGenre =
        genreFilter
            ? genreFilter.value
            : "all";


    const selectedLabel =
        labelFilter
            ? labelFilter.value
            : "all";


    const selectedHit =
        hitFilter
            ? hitFilter.value
            : "all";


    const filteredData =
        songData.filter(
            function (row) {


                // ----------------------------------------
                // ประเภทเพลง
                // ----------------------------------------

                if (
                    selectedGenre !== "all" &&
                    row.genre !== selectedGenre
                ) {

                    return false;

                }


                // ----------------------------------------
                // ระดับค่ายเพลง
                // ----------------------------------------

                if (
                    selectedLabel !== "all" &&
                    row.label_tier !== selectedLabel
                ) {

                    return false;

                }


                // ----------------------------------------
                // เพลงฮิต
                // ----------------------------------------

                if (
                    selectedHit === "hit" &&
                    toNumber(
                        row.is_hit
                    ) !== 1
                ) {

                    return false;

                }


                // ----------------------------------------
                // เพลงไม่ฮิต
                // ----------------------------------------

                if (
                    selectedHit === "non-hit" &&
                    toNumber(
                        row.is_hit
                    ) !== 0
                ) {

                    return false;

                }


                return true;

            }
        );


    console.log(
        "จำนวนข้อมูลหลังกรอง:",
        filteredData.length
    );


    updateDashboard(
        filteredData
    );

}


// ============================================================
// 14. รีเซ็ตตัวกรอง
// ============================================================

function resetFilters() {

    const genreFilter =
        document.getElementById(
            "genreFilter"
        );


    const labelFilter =
        document.getElementById(
            "labelFilter"
        );


    const hitFilter =
        document.getElementById(
            "hitFilter"
        );


    if (genreFilter) {

        genreFilter.value =
            "all";

    }


    if (labelFilter) {

        labelFilter.value =
            "all";

    }


    if (hitFilter) {

        hitFilter.value =
            "all";

    }


    updateDashboard(
        songData
    );

}


// ============================================================
// 15. อัปเดต Dashboard ทั้งหมด
// ============================================================

function updateDashboard(data) {

    console.log(
        "กำลังอัปเดต Dashboard:",
        data.length,
        "รายการ"
    );


    updateKPIs(data);

    createScatterChart(data);

    createGenreChart(data);

    createLabelChart(data);

    createCorrelationChart(data);

    updateInsight(data);

}


// ============================================================
// 16. อัปเดตตัวเลขสรุป
// ============================================================

function updateKPIs(data) {


    // --------------------------------------------------------
    // จำนวนเพลง
    // --------------------------------------------------------

    const totalSongs =
        data.length;


    // --------------------------------------------------------
    // ค่าเฉลี่ยยอดสตรีมหลัง 3 ปี
    // --------------------------------------------------------

    let averageStreams = 0;


    if (
        data.length > 0
    ) {

        const totalStreams =
            data.reduce(
                function (
                    sum,
                    row
                ) {

                    return (
                        sum +
                        toNumber(
                            row.streams_3yr
                        )
                    );

                },
                0
            );


        averageStreams =
            totalStreams /
            data.length;

    }


    // --------------------------------------------------------
    // อัตราเพลงฮิต
    // --------------------------------------------------------

    let hitRate = 0;


    if (
        data.length > 0
    ) {

        const hitSongs =
            data.filter(
                function (row) {

                    return (
                        toNumber(
                            row.is_hit
                        ) === 1
                    );

                }
            ).length;


        hitRate =
            (
                hitSongs /
                data.length
            ) * 100;

    }


    // --------------------------------------------------------
    // ค่าเฉลี่ยอายุความนิยม
    // --------------------------------------------------------

    let averageHalfLife = 0;


    if (
        data.length > 0
    ) {

        const totalHalfLife =
            data.reduce(
                function (
                    sum,
                    row
                ) {

                    return (
                        sum +
                        toNumber(
                            row.halflife_days
                        )
                    );

                },
                0
            );


        averageHalfLife =
            totalHalfLife /
            data.length;

    }


    // --------------------------------------------------------
    // แสดงผล
    // --------------------------------------------------------

    setText(
        "totalSongs",
        formatNumber(
            totalSongs
        )
    );


    setText(
        "avgStreams",
        formatNumber(
            Math.round(
                averageStreams
            )
        )
    );


    setText(
        "hitRate",
        hitRate.toFixed(1) +
        "%"
    );


    setText(
        "avgHalfLife",
        averageHalfLife.toFixed(1) +
        " วัน"
    );

}


// ============================================================
// 17. กราฟกระจาย
// ============================================================
//
// แกน X = ยอดสตรีมเดือนแรก
// แกน Y = ยอดสตรีมหลัง 3 ปี
// ============================================================

function createScatterChart(data) {

    if (scatterChart) {

        scatterChart.destroy();

        scatterChart = null;

    }


    const canvas =
        document.getElementById(
            "scatterChart"
        );


    if (!canvas) {

        console.warn(
            "ไม่พบพื้นที่กราฟ scatterChart"
        );

        return;

    }


    const points = [];


    data.forEach(
        function (row) {

            const x =
                toNumber(
                    row.first_month_streams
                );


            const y =
                toNumber(
                    row.streams_3yr
                );


            if (
                x > 0 &&
                y > 0
            ) {

                points.push({

                    x: x,

                    y: y

                });

            }

        }
    );


    scatterChart =
        new Chart(
            canvas,
            {

                type: "scatter",


                data: {

                    datasets: [

                        {

                            label:
                                "เพลง",

                            data:
                                points,

                            pointRadius:
                                3,

                            pointHoverRadius:
                                6,

                            borderWidth:
                                0

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    plugins: {

                        legend: {

                            display:
                                false

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return [

                                            "ยอดสตรีมเดือนแรก: " +
                                            formatNumber(
                                                context.parsed.x
                                            ),

                                            "ยอดสตรีมหลัง 3 ปี: " +
                                            formatNumber(
                                                context.parsed.y
                                            )

                                        ];

                                    }

                            }

                        }

                    },


                    scales: {

                        x: {

                            type:
                                "logarithmic",


                            title: {

                                display:
                                    true,

                                text:
                                    "ยอดสตรีมเดือนแรก"

                            }

                        },


                        y: {

                            type:
                                "logarithmic",


                            title: {

                                display:
                                    true,

                                text:
                                    "ยอดสตรีมหลัง 3 ปี"

                            }

                        }

                    }

                }

            }
        );

}


// ============================================================
// 18. กราฟจำนวนเพลงตามประเภท
// ============================================================

function createGenreChart(data) {

    if (genreChart) {

        genreChart.destroy();

        genreChart = null;

    }


    const canvas =
        document.getElementById(
            "genreChart"
        );


    if (!canvas) {

        console.warn(
            "ไม่พบพื้นที่กราฟ genreChart"
        );

        return;

    }


    const genreCount = {};


    data.forEach(
        function (row) {

            const genre =
                row.genre ||
                "ไม่ระบุ";


            if (
                genreCount[genre] ===
                undefined
            ) {

                genreCount[genre] =
                    0;

            }


            genreCount[genre]++;

        }
    );


    const sorted =
        Object.entries(
            genreCount
        ).sort(
            function (a, b) {

                return b[1] - a[1];

            }
        );


    const labels =
        sorted.map(
            function (item) {

                return item[0];

            }
        );


    const values =
        sorted.map(
            function (item) {

                return item[1];

            }
        );


    genreChart =
        new Chart(
            canvas,
            {

                type: "bar",


                data: {

                    labels:
                        labels,


                    datasets: [

                        {

                            label:
                                "จำนวนเพลง",

                            data:
                                values,

                            borderWidth:
                                0,

                            borderRadius:
                                5

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    plugins: {

                        legend: {

                            display:
                                false

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            "จำนวนเพลง: " +
                                            formatNumber(
                                                context.parsed.y
                                            )
                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        x: {

                            title: {

                                display:
                                    true,

                                text:
                                    "ประเภทเพลง"

                            }

                        },


                        y: {

                            beginAtZero:
                                true,

                            title: {

                                display:
                                    true,

                                text:
                                    "จำนวนเพลง"

                            }

                        }

                    }

                }

            }
        );

}


// ============================================================
// 19. กราฟอัตราเพลงฮิตตามระดับค่ายเพลง
// ============================================================

function createLabelChart(data) {

    if (labelChart) {

        labelChart.destroy();

        labelChart = null;

    }


    const canvas =
        document.getElementById(
            "labelChart"
        );


    if (!canvas) {

        console.warn(
            "ไม่พบพื้นที่กราฟ labelChart"
        );

        return;

    }


    const groups = {};


    data.forEach(
        function (row) {

            const tier =
                row.label_tier ||
                "ไม่ระบุ";


            if (
                !groups[tier]
            ) {

                groups[tier] = {

                    total: 0,

                    hits: 0

                };

            }


            groups[tier].total++;


            if (
                toNumber(
                    row.is_hit
                ) === 1
            ) {

                groups[tier].hits++;

            }

        }
    );


    const labels =
        Object.keys(
            groups
        );


    const hitRates =
        labels.map(
            function (tier) {

                const group =
                    groups[tier];


                if (
                    group.total === 0
                ) {

                    return 0;

                }


                return (
                    group.hits /
                    group.total
                ) * 100;

            }
        );


    labelChart =
        new Chart(
            canvas,
            {

                type: "doughnut",


                data: {

                    labels:
                        labels,


                    datasets: [

                        {

                            label:
                                "อัตราเพลงฮิต",

                            data:
                                hitRates,

                            borderWidth:
                                2

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            context.label +
                                            ": " +
                                            context.parsed.toFixed(
                                                1
                                            ) +
                                            "%"
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


// ============================================================
// 20. กราฟค่าสหสัมพันธ์
// ============================================================
//
// วิเคราะห์ความสัมพันธ์ของตัวแปรต่าง ๆ
// กับยอดสตรีมหลัง 3 ปี
// ============================================================

function createCorrelationChart(data) {

    if (correlationChart) {

        correlationChart.destroy();

        correlationChart = null;

    }


    const canvas =
        document.getElementById(
            "correlationChart"
        );


    if (!canvas) {

        console.warn(
            "ไม่พบพื้นที่กราฟ correlationChart"
        );

        return;

    }


    // ตัวแปรที่ต้องการวิเคราะห์

    const numericColumns = [

        "energy",

        "valence",

        "danceability",

        "acousticness",

        "instrumentalness",

        "tempo_bpm",

        "song_length_sec",

        "marketing_budget",

        "playlist_adds_first_month",

        "editorial_playlist",

        "tiktok_virality",

        "artist_prior_monthly_listeners",

        "featured_artist",

        "first_month_streams",

        "halflife_days",

        "slow_burner",

        "is_hit"

    ];


    const results = [];


    numericColumns.forEach(
        function (column) {

            const x = [];

            const y = [];


            data.forEach(
                function (row) {

                    const xValue =
                        toNumber(
                            row[column]
                        );


                    const yValue =
                        toNumber(
                            row.streams_3yr
                        );


                    if (
                        Number.isFinite(
                            xValue
                        ) &&
                        Number.isFinite(
                            yValue
                        )
                    ) {

                        x.push(
                            xValue
                        );

                        y.push(
                            yValue
                        );

                    }

                }
            );


            if (
                x.length > 1
            ) {

                const correlation =
                    pearsonCorrelation(
                        x,
                        y
                    );


                results.push({

                    column:
                        column,

                    correlation:
                        correlation

                });

            }

        }
    );


    // เรียงตามค่าความสัมพันธ์

    results.sort(
        function (a, b) {

            return (
                Math.abs(
                    b.correlation
                ) -
                Math.abs(
                    a.correlation
                )
            );

        }
    );


    // แสดง 10 ตัวแปรที่มีความสัมพันธ์สูงสุด

    const topResults =
        results.slice(
            0,
            10
        );


    const labels =
        topResults.map(
            function (item) {

                return translateColumnName(
                    item.column
                );

            }
        );


    const values =
        topResults.map(
            function (item) {

                return Number(
                    item.correlation.toFixed(
                        3
                    )
                );

            }
        );


    correlationChart =
        new Chart(
            canvas,
            {

                type: "bar",


                data: {

                    labels:
                        labels,


                    datasets: [

                        {

                            label:
                                "ค่าสหสัมพันธ์เพียร์สัน",

                            data:
                                values,

                            borderWidth:
                                0,

                            borderRadius:
                                5

                        }

                    ]

                },


                options: {

                    indexAxis:
                        "y",


                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    plugins: {

                        legend: {

                            display:
                                false

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            "ค่าสหสัมพันธ์: " +
                                            context.parsed.x.toFixed(
                                                3
                                            )
                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        x: {

                            min:
                                -1,

                            max:
                                1,


                            title: {

                                display:
                                    true,

                                text:
                                    "ค่าสหสัมพันธ์เพียร์สัน"

                            }

                        }

                    }

                }

            }
        );

}


// ============================================================
// 21. แปลชื่อคอลัมน์เป็นภาษาไทย
// ============================================================

function translateColumnName(
    column
) {

    const translations = {

        energy:
            "พลังงานของเพลง",

        valence:
            "อารมณ์ของเพลง",

        danceability:
            "ความเหมาะกับการเต้น",

        acousticness:
            "ความเป็นอะคูสติก",

        instrumentalness:
            "ความเป็นดนตรีบรรเลง",

        tempo_bpm:
            "ความเร็วเพลง (BPM)",

        song_length_sec:
            "ความยาวเพลง (วินาที)",

        marketing_budget:
            "งบประมาณการตลาด",

        playlist_adds_first_month:
            "การเพิ่มเข้าเพลย์ลิสต์เดือนแรก",

        editorial_playlist:
            "เพลย์ลิสต์บรรณาธิการ",

        tiktok_virality:
            "กระแสไวรัลบน TikTok",

        artist_prior_monthly_listeners:
            "ผู้ฟังรายเดือนเดิมของศิลปิน",

        featured_artist:
            "ศิลปินรับเชิญ",

        first_month_streams:
            "ยอดสตรีมเดือนแรก",

        halflife_days:
            "อายุความนิยม",

        slow_burner:
            "เพลงที่เติบโตอย่างช้า ๆ",

        is_hit:
            "สถานะเพลงฮิต"

    };


    return (
        translations[column] ||
        column
    );

}


// ============================================================
// 22. คำนวณค่าสหสัมพันธ์เพียร์สัน
// ============================================================

function pearsonCorrelation(
    x,
    y
) {

    const n =
        Math.min(
            x.length,
            y.length
        );


    if (
        n < 2
    ) {

        return 0;

    }


    let sumX = 0;

    let sumY = 0;


    for (
        let i = 0;
        i < n;
        i++
    ) {

        sumX +=
            x[i];

        sumY +=
            y[i];

    }


    const meanX =
        sumX / n;


    const meanY =
        sumY / n;


    let numerator = 0;

    let denominatorX = 0;

    let denominatorY = 0;


    for (
        let i = 0;
        i < n;
        i++
    ) {

        const differenceX =
            x[i] -
            meanX;


        const differenceY =
            y[i] -
            meanY;


        numerator +=
            differenceX *
            differenceY;


        denominatorX +=
            differenceX *
            differenceX;


        denominatorY +=
            differenceY *
            differenceY;

    }


    const denominator =
        Math.sqrt(
            denominatorX *
            denominatorY
        );


    if (
        denominator === 0
    ) {

        return 0;

    }


    return (
        numerator /
        denominator
    );

}


// ============================================================
// 23. สร้างข้อค้นพบจากข้อมูล
// ============================================================

function updateInsight(data) {

    const element =
        document.getElementById(
            "insightText"
        );


    if (!element) {

        return;

    }


    if (
        data.length === 0
    ) {

        element.textContent =
            "ไม่พบเพลงที่ตรงกับเงื่อนไขที่เลือก";

        return;

    }


    // ข้อมูลยอดสตรีมเดือนแรก

    const x =
        data.map(
            function (row) {

                return toNumber(
                    row.first_month_streams
                );

            }
        );


    // ข้อมูลยอดสตรีมหลัง 3 ปี

    const y =
        data.map(
            function (row) {

                return toNumber(
                    row.streams_3yr
                );

            }
        );


    // คำนวณค่าสหสัมพันธ์

    const correlation =
        pearsonCorrelation(
            x,
            y
        );


    let strength = "";


    if (
        Math.abs(
            correlation
        ) >= 0.7
    ) {

        strength =
            "มีความสัมพันธ์ในระดับสูง";

    }

    else if (
        Math.abs(
            correlation
        ) >= 0.4
    ) {

        strength =
            "มีความสัมพันธ์ในระดับปานกลาง";

    }

    else {

        strength =
            "มีความสัมพันธ์ในระดับต่ำ";

    }


    element.textContent =
        "จากข้อมูลที่เลือกจำนวน " +
        formatNumber(
            data.length
        ) +
        " เพลง พบว่าความสัมพันธ์ระหว่างยอดสตรีมเดือนแรกกับยอดสตรีมหลัง 3 ปี มีค่าสหสัมพันธ์เพียร์สันเท่ากับ " +
        correlation.toFixed(3) +
        " ซึ่งจัดอยู่ในกลุ่ม" +
        strength +
        " ทั้งนี้ค่าสหสัมพันธ์แสดงถึงความสัมพันธ์ระหว่างตัวแปร แต่ไม่ได้หมายความว่าตัวแปรหนึ่งเป็นสาเหตุโดยตรงของอีกตัวแปรหนึ่ง";

}


// ============================================================
// 24. แสดงข้อความเมื่อโหลดข้อมูลไม่สำเร็จ
// ============================================================

function showDataError(
    errorMessage
) {

    // ลบข้อความเดิมถ้ามี

    const oldMessage =
        document.getElementById(
            "dataErrorMessage"
        );


    if (oldMessage) {

        oldMessage.remove();

    }


    const message =
        document.createElement(
            "div"
        );


    message.id =
        "dataErrorMessage";


    message.style.cssText =
        `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #b91c1c;
        color: white;
        padding: 18px 22px;
        border-radius: 10px;
        z-index: 99999;
        font-family: Arial, sans-serif;
        max-width: 90%;
        text-align: center;
        line-height: 1.7;
        box-shadow: 0 5px 20px rgba(0,0,0,.2);
        `;


    message.innerHTML =
        `
        <strong>
            ไม่สามารถโหลดข้อมูลได้
        </strong>

        <br><br>

        กรุณาตรวจสอบว่าไฟล์

        <br>

        <code>
            song_longevity.csv
        </code>

        <br>

        อยู่ในโฟลเดอร์เดียวกับ

        <br>

        <code>
            index.html
        </code>

        และ

        <code>
            app.js
        </code>

        <br><br>

        รายละเอียด:
        ${errorMessage || "ไม่ทราบสาเหตุ"}
        `;


    document.body.appendChild(
        message
    );

}


// ============================================================
// 25. จบการทำงาน
// ============================================================

console.log(
    "โหลด app.js ภาษาไทยเรียบร้อยแล้ว"
);