// Define margins, dimensions, and some line colors
var margin = {top: 40, right: 120, bottom: 30, left: 40};
var width = 600 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

// Define the scales and tell D3 how to draw the line
var x = d3.scaleLinear().domain([1993, 2017]).range([0, width]);     
var y = d3.scaleLinear().domain([0, 350]).range([height, 0]);
var line = d3.line().x(d => x(d.year)).y(d => y(d.population));

var chart = d3.select('#paper_line').append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  
var tooltip = d3.select('#line_tooltip');
var tooltipLine = chart.append('line');
  
// Add the axes and a title
var xAxis = d3.axisBottom(x).tickFormat(d3.format('.4'));
var yAxis = d3.axisLeft(y).tickFormat(d3.format('.2s'));
chart.append('g').call(yAxis); 
chart.append('g').attr('transform', 'translate(0,' + height + ')').call(xAxis);
chart.append('text').html('歷屆投稿文章數量').attr('id','gtitle').attr('x', 20).attr('y', -5);//圖標題
  
// Load the data and draw a chart
let states, tipBox;
d3.json('data/year-papers.json', d => {
  states = d;

  chart.selectAll()
    .data(states).enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', d => d.color)
    .attr('stroke-width', 2)
    .datum(d => d.history)
    .attr('d', line);
  
  chart.selectAll()
    .data(states).enter()
    .append('text') //曲線尾巴的文字
    .html(d => d.name)
    .attr('fill', d => d.color)
    .attr('alignment-baseline', 'middle')
    .attr('x', width-5)
    .attr('dx', '.5em')
    .attr('y', d => y(d.tagY));//曲線尾巴的文字的Y軸位置
    
  tipBox = chart.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('opacity', 0)
    .on('mousemove', drawTooltip)
    .on('mouseout', removeTooltip);
})

function removeTooltip() {
  if (tooltip) tooltip.style('display', 'none');
  if (tooltipLine) tooltipLine.attr('stroke', 'none');
}

function drawTooltip() {
  
//  設定滑鼠跟對齊線，跟Ｘ軸的相關關係_每10年
//  var year = Math.floor((x.invert(d3.mouse(tipBox.node())[0]) + 5) / 10) * 10;
    
//  設定滑鼠跟對齊線，跟Ｘ軸的相關關係_每1年
  var year = Math.floor(x.invert(d3.mouse(tipBox.node())[0])+1);
  
  states.sort((a, b) => {
    return b.history.find(h => h.year == year).population - a.history.find(h => h.year == year).population;
  })
  
  //對齊線的動態位置    
  tooltipLine.attr('stroke', 'black')
    .attr('x1', x(year))
    .attr('x2', x(year))
    .attr('y1', 0)
    .attr('y2', height);
  
  tooltip.html(year)
    .style('display', 'block')
//    .style('left', (d3.event.pageX-100)+'px') //資訊框位置跟著滑鼠跑
//    .style('top', (d3.event.pageY-100)+'px') //d3.event.pageY是滑鼠的位置函數
    .style('left', '100px') //固定資訊框位置
    .style('top', '246px') //固定資訊框位置
    .selectAll()
    .data(states).enter()
    .append('div')
    .style('color', d => d.color)
    .html(d => d.name + ': ' + d.history.find(h => h.year == year).population + "篇");
}
