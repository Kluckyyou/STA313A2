// Load the data
d3.csv("data/Bicycle_Thefts_Open_Data.csv").then(data => {

    // Filter for specific STATUS values
    const filteredData = data.filter(d => ["STOLEN", "RECOVERED", "UNKNOWN"].includes(d.STATUS));

    // Prepare the data for the STATUS pie chart
    const statusCounts = d3.rollup(filteredData, v => v.length, d => d.STATUS);
    const totalCases = d3.sum(statusCounts.values());

    // Set dimensions for the pie chart
    const width = 400, height = 400, radius = Math.min(width, height) / 2;

    // Tooltip for pie chart
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Set up pie chart container
    const svg = d3.select("#status-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Define color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create pie and arc
    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Draw main pie chart
    svg.selectAll("path")
        .data(pie(statusCounts))
        .enter().append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data[0]))
        .on("mouseover", (event, d) => {
            const percentage = ((d.data[1] / totalCases) * 100).toFixed(2);
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Status: ${d.data[0]}<br>Count: ${d.data[1]}<br>Percentage: ${percentage}%`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
        })
        .on("click", (event, d) => {
            // Filter data based on selected status and calculate time difference
            const statusFilteredData = filteredData.filter(row => row.STATUS === d.data[0]);
            const timeDiffs = statusFilteredData.map(row => {
                const occDate = new Date(row.OCC_DATE);
                const reportDate = new Date(row.REPORT_DATE);
                const diffHours = (reportDate - occDate) / (1000 * 60 * 60);
                if (diffHours <= 12) return "within 12 hours";
                if (diffHours <= 24) return "12 to 24 hours";
                if (diffHours <= 48) return "1 to 2 days";
                if (diffHours <= 168) return "2 to 7 days";
                return "over 7 days";
            });

            // Count occurrences for each time range
            const timeCounts = d3.rollup(timeDiffs, v => v.length, d => d);
            const timeTotal = d3.sum(timeCounts.values());

            // Draw sub pie chart for time ranges
            drawSubPieChart(Array.from(timeCounts), timeTotal);
        });

    // Function to draw the sub pie chart
    function drawSubPieChart(data, total) {
        // Clear existing sub pie chart and legend
        d3.select("#sub-pie-chart").selectAll("*").remove();
        d3.select("#sub-pie-legend").selectAll("*").remove();

        const subSvg = d3.select("#sub-pie-chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const subPie = d3.pie().value(d => d[1]);
        const subArc = d3.arc().innerRadius(0).outerRadius(radius / 2);

        subSvg.selectAll("path")
            .data(subPie(data))
            .enter().append("path")
            .attr("d", subArc)
            .attr("fill", d => color(d.data[0]))
            .on("mouseover", (event, d) => {
                const percentage = ((d.data[1] / total) * 100).toFixed(2);
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`Time Range: ${d.data[0]}<br>Count: ${d.data[1]}<br>Percentage: ${percentage}%`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Draw sub-pie legend for time ranges
        drawLegend("#sub-pie-legend", data.map(d => d[0]), color);
    }

    // Function to draw legends with improved spacing
    function drawLegend(containerId, categories, colorScale) {
        const legend = d3.select(containerId)
            .append("svg")
            .attr("width", 200)
            .attr("height", categories.length * 30)
            .selectAll("g")
            .data(categories)
            .enter().append("g")
            .attr("transform", (d, i) => `translate(0, ${i * 30})`);

        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", d => colorScale(d));

        legend.append("text")
            .attr("x", 30) // Add space between the box and text
            .attr("y", 15)
            .style("font-size", "12px")
            .text(d => d);
    }

    // Draw main legend for STATUS pie chart
    drawLegend("#status-legend", Array.from(statusCounts.keys()), color);
});
