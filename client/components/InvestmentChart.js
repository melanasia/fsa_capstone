import React from "react";
import Chart from "react-apexcharts";

export default function LineChart({dataArr}) {
  const options = {
    chart: {
      height: 350,
      type: "line",
      stacked: false,
      width: '100%'
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#FF1654", "#247BA0", '#3d405b', '#000000'],
    series: dataArr.values,
    stroke: {
      width: [4, 4],
    },
    plotOptions: {
      bar: {
        columnWidth: "20%",
      },
    },
    xaxis: {
      categories: dataArr.categories,
    },
    yaxis: [
      {
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: "#000000",
        },
        labels: {
          style: {
            colors: "#000000",
          },
        },
        title: {
          text: "Closing Price",
          style: {
            color: "#000000",
          },
        },
      },
    ],
    tooltip: {
      shared: false,
      intersect: true,
      x: {
        show: false,
      },
    },
    legend: {
      horizontalAlign: "left",
      offsetX: 40,
    },
  };
  return (
    <div>
      <Chart
        options={options}
        series={options.series}
        type="line"
        width='500'
        height='400'
      />
    </div>
  )};
