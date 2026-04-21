// import { Doughnut } from 'react-chartjs-2';
// import styles from './CompetitiveOverview.module.css';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// ChartJS.register(ArcElement, Tooltip, Legend);

// const WinRateDoughnut = () => {
//   const data = {
//     datasets: [
//       {
//         data: [76, 24],
//         backgroundColor: ['#F8C25C', 'rgba(217, 217, 217, 0.2)'],
//         hoverOffset: 2,
//       },
//     ],
//   };

//   const options = {
//     cutout: '75%',
//     rotation: -90,
//     circumference: 360,
//     maintainAspectRatio: false,
//     animation: {
//       animateRotate: true,
//       animateScale: true,
//     },
//     plugins: {
//       tooltip: {
//         enabled: true,
//         callbacks: {
//           label: (context) => {
//             return `${context.raw}%`;
//           },
//         },
//       },
//       legend: {
//         display: false,
//       },
//     },
//   };

//   return (
//     <div className={styles.doughnutContainer}>
//       <div className={styles.doughnutChart}>
//         <Doughnut data={data} options={options} />
//         <div className={styles.doughnutLabel}>
//           <span className={styles.winRateLabel}>Win Rate</span>
//           <span className={styles.winRateValue}>76%</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WinRateDoughnut;