import * as d3 from "@types/d3";

const dataUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
document.addEventListener("DOMContentLoaded", function () {
    const req = new XMLHttpRequest();
    req.open('GET', dataUrl, true);
    req.onreadystatechange = function () {
        let json;
        if (req.readyState === 4 && req.status === 200) {
            json = JSON.parse(req.responseText);
            setData(json)
        }
    };
    req.send();
});

const gradient = ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"];
const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const h = 600, w = 1500, padding = 100;

d3.select('#holder')
    .append('svg')
    .attr('width', w)
    .attr('height', h);

/**
 * Api object from FCC
 * @typedef {Object} ApiModel
 * @property {Number} year     - Year of the measurement
 * @property {Number} month    - Month of the measurement
 * @property {Number} variance - Variance of temperature with base year
 */

/**
 *
 * @param {Number} baseTemp
 * @param {[ApiModel]} dataset
 */
function setData({baseTemperature: baseTemp, monthlyVariance: dataset}) {
    /**
     *
     * @param {ApiModel} x
     * @return {Date}
     */
    const getDate = x => new Date(x.year, x.month - 1, 1);
    /**
     *
     * @param {ApiModel} x
     * @return {Number}
     */
    const getVariance = x => temperature(x.variance);

    /**
     *
     * @param {Number} x
     * @return {Number}
     */
    const temperature = x => baseTemp + x;


    const xDomain = [d3.min(dataset, getDate), d3.max(dataset, getDate)];

    const yDomain = [d3.min(dataset, getVariance), d3.max(dataset, getVariance)];
    console.log(yDomain);

    const xScale = d3.scaleTime()
        .domain(xDomain)
        .range([padding, w - padding]);

    const yScale = d3.scaleLinear()
        .domain([0.5, 12.5])
        .range([padding, h - padding]);

    const colorScale = d3.scaleQuantile()
        .domain(yDomain)
        .range(gradient);


    const xAxis = d3.axisBottom(xScale)
            .tickSizeOuter(0)
            .tickArguments([d3.timeYear.every(10)]),

        yAxis = d3.axisLeft(yScale)
            .tickSizeOuter(0)
            //.ticks(12)
            .tickFormat((val, index) => months[index]);


    const cellHeight = (h - 2 * padding) / months.length;
    const cellOffset = cellHeight / 2;


    d3.select('svg').call(svg => {

        svg.append('g')
            .attr("id", "legend")
            .attr('transform', `translate(${padding},${h - padding / 2})`)
            .call((g) => {
                const width = 400;
                const height = 30;
                const min = yDomain[0];
                const max = yDomain[1];
                const step = (max - min) / gradient.length;

                const range = d3.range(min, max, step);

                console.log(range)

                const legendScale = d3.scaleLinear()
                    .domain(yDomain)
                    .range([0, width]);

                const axis = d3.axisBottom(legendScale)
                    .tickSizeOuter(0)
                    .tickFormat(d3.format(".1f"))
                    .tickValues(range)
                ;
                g.selectAll('rect')
                    .data(range)
                    .enter()
                    .append('rect')
                    .style('fill', d => colorScale(d))
                    .attr('width', width / gradient.length)
                    .attr('height', height)
                    .attr('x', x => legendScale(x))
                    .attr('y', 0)
                ;
                g.append('g')
                    .attr("transform", `translate(0,${height})`)
                    .call(axis)
            })
        ;

        svg.selectAll('rect')
            .data(dataset)
            .enter()
            .append('rect')
            .attr('data-month', d => d.month - 1)
            .attr('data-temp', d => d.variance)
            .attr('data-year', d => d.year)
            .attr('class', "cell")
            .style('fill', d => colorScale(temperature(d.variance)))
            .attr('width', 5)
            .attr('height', cellHeight)
            .attr('x', d => xScale(new Date(d.year, 0, 1)))
            .attr('y', d => yScale(d.month) - cellOffset)
        ;

        svg.append("g")
            .attr('id', 'x-axis')
            .attr("transform", `translate(0,${h - padding})`)
            .call(xAxis);

        svg.append("g")
            .attr('id', 'y-axis')
            .attr("transform", `translate(${padding},0)`)
            .call(yAxis);

        svg.append("text")
            .attr("class", "axisLabel")
            .text('Years')
            .style("text-anchor", "middle")
            .attr("x", (w - padding) / 2)
            .attr("y", h - padding + 40);

        svg.append("text")
            .attr("class", "axisLabel")
            .text('Months')
            .style("text-anchor", "middle")
            .attr("transform", `rotate(-90)`)
            .attr("x", -h / 2)
            .attr("y", 40);


    });


    // const data = {tooltip: d3.select('#tooltip'), xScale, yScale};
    //

    // .on('mouseover', wrap(handleMouseOver, data))
    // .on('mouseout', wrap(handleMouseOut, data));
}


/**
 *
 * @param {ApiModel} d
 */
function handleMouseOver(args, d) {
    const dot = d3.select(this);
    const {tooltip} = args;
    const {pageX: x, pageY: y} = d3.event;
    tooltip.style("display", "block");
    tooltip.style("left", x + 20 + "px");
    tooltip.html(toolTipHtml(d));
    const height = tooltip.node().getBoundingClientRect().height;
    tooltip.style("top", y - parseInt(height / 2) + "px");
    tooltip.attr('data-year', d.Year);


    dot.transition().duration(100).attr('r', 10);

}

function handleMouseOut(args) {
    const {tooltip} = args;
    tooltip.style("display", "none");

    const dot = d3.select(this);
    dot.transition().duration(100).attr('r', 8);

}
