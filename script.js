// Load the data
d3.csv("Bicycle_Thefts_Open_Data.csv").then(data => {

    // Aggregation functions for each plot type
    const countByYear = d3.rollup(data, v => v.length, d => d.OCC_YEAR);
    const countByMonth = d3.rollup(data, v => v.length, d => d.OCC_MONTH);
    const countByDayOfWeek = d3.rollup(data, v => v.length, d => d.OCC_DOW);
    const countByHour = d3.rollup(data, v => v.length, d => +d.OCC_HOUR);
  
    // Convert maps to sorted arrays for plotting
    const yearData = Array.from(countByYear, ([key, value]) => ({ year: key, count: value })).sort((a, b) => a.year - b.year);
    const monthData = Array.from(countByMonth, ([key, value]) => ({ month: key, count: value }));
    const dayOfWeekData = Array.from(countByDayOfWeek, ([key, value]) => ({ day: key, count: value }));
    const hourData = Array.from(countByHour, ([key, value]) => ({ hour: key, count: value })).sort((a, b) => a.hour - b.hour);
  
    // Define plot configuration
    const width = 500, height = 300, margin = { top: 20, right: 20, bottom: 50, left: 50 };
  
    // Tooltip setup
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
  
    // Helper function to create bar charts
    function createBarChart(data, xKey, yKey, xLabel, selector) {
      const svg = d3.select(selector).append("svg").attr("width", width).attr("height", height);
      const x = d3.scaleBand().domain(data.map(d => d[xKey])).range([margin.left, width - margin.right]).padding(0.1);
      const y = d3.scaleLinear().domain([0, d3.max(data, d => d[yKey])]).nice().range([height - margin.bottom, margin.top]);
  
      svg.append("g")
        .selectAll("rect")
        .data(data)
        .enter().append("rect")
        .attr("x", d => x(d[xKey]))
        .attr("y", d => y(d[yKey]))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d[yKey]))
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Count: ${d[yKey]}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
        });
  
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
  
      svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));
  
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text(xLabel);
    }
  
    // Helper function to create line chart for hourly distribution
    function createLineChart(data, xKey, yKey, xLabel, selector) {
      const svg = d3.select(selector).append("svg").attr("width", width).attr("height", height);
      const x = d3.scaleLinear().domain(d3.extent(data, d => d[xKey])).range([margin.left, width - margin.right]);
      const y = d3.scaleLinear().domain([0, d3.max(data, d => d[yKey])]).nice().range([height - margin.bottom, margin.top]);
  
      const line = d3.line()
        .x(d => x(d[xKey]))
        .y(d => y(d[yKey]));
  
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);
  
      svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 4)
        .attr("cx", d => x(d[xKey]))
        .attr("cy", d => y(d[yKey]))
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Count: ${d[yKey]}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
        });
  
      svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x));
      svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));
  
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text(xLabel);
    }
  
    // Generate charts
    createBarChart(yearData, "year", "count", "Bikes Lost by Year", "#year-chart");
    createBarChart(monthData, "month", "count", "Bikes Lost by Month", "#month-chart");
    createBarChart(dayOfWeekData, "day", "count", "Bikes Lost by Day of Week", "#dayOfWeek-chart");
    createLineChart(hourData, "hour", "count", "Bikes Lost by Hour", "#hour-chart");
  
    // Show only the selected chart
    function updateChart() {
      const selectedPlot = document.getElementById("time-selector").value;
      document.querySelectorAll(".timechart").forEach(chart => {
        chart.style.display = "none";
      });
      document.getElementById(`${selectedPlot}-chart`).style.display = "block";
    }
  
    // Set initial view and add event listener for dropdown change
    updateChart();
    document.getElementById("time-selector").addEventListener("change", updateChart);
  });
  
  
