import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FilterComponent } from '../../dash-component/filter/filter.component';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { AuthService } from '../../../login/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
HighchartsMore(Highcharts);

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    private DashDataService: DashDataService,
    private authService: AuthService,
    public snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private router: Router
  ) {}
  
  deviceOptions: any[] = [];
  selectedDevice!: string ;
  selectedDeviceInterval: any = '1hour';    
  CompanyEmail!: string | null;
  temperatureData: any[] = [];
  temperatureRData: any[] = [];
  temperatureYData: any[] = [];
  temperatureBData: any[] = [];
  humidityData: any[] = [];
  timestampData: any[] = [];
  DeviceName!: any;
  DeviceStatus!: any;
  DeviceType!: any;
  DeviceLastUpdatedTime!: any;
  DeviceTrigger!: any;
  loading1 = true;


  ngOnInit() {
  const sessionData = sessionStorage.getItem('data');
  const sessionDataStatus = sessionStorage.getItem('dataStatus');
  const sessionDevice = sessionStorage.getItem('device');
  const sessionDeviceType = sessionStorage.getItem('deviceType');
  
  const loadData = () => {
    if (sessionData && sessionDataStatus && sessionDevice && sessionDeviceType) {
      const jsonData = JSON.parse(sessionData);
      const jsonDataStatus = JSON.parse(sessionDataStatus);
      this.DeviceType = sessionDeviceType;
      console.log("sessionDeviceType :-", this.DeviceType);

      // Use setTimeout for the delay
      setTimeout(() => {
        this.processChartData(jsonData);
        this.createDonutChart(jsonDataStatus.dataStatus);
        this.fetchDeviceInfo(sessionDevice);
      }, 1000);
    } else {
      this.getUserDevices();
    }
  };

  loadData();
}


  getUserDevices() {
    this.CompanyEmail = this.authService.getCompanyEmail();
    if (this.CompanyEmail) {
      this.DashDataService.userDevices(this.CompanyEmail).subscribe(
        (devices: any) => {
          this.deviceOptions = devices.devices;
          if (this.deviceOptions.length > 0) {
            this.selectedDevice = this.deviceOptions[0].DeviceUID;
            this.DeviceType = this.deviceOptions[0].DeviceType;
            sessionStorage.setItem('device', this.selectedDevice);
            sessionStorage.setItem('deviceType', this.DeviceType);
            console.log("Bydefault DeviceType", this.DeviceType);

            this.fetchDefaultData();
            this.fetchDeviceInfo(this.selectedDevice);
          }
        },
        (error) => {
          this.snackBar.open('Error while fetching user devices!', 'Dismiss', {
            duration: 2000
        });
      }
      );
    }
  }

  createDonutChart(dataStatus: any) {
    const donutChartData = dataStatus.map((entry: any) => {
      const formattedPercentage = parseFloat(entry.percentage.toFixed(2)); // Format to two decimal places
      let color;

      if (entry.status === 'online') {
        color = {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, '#78f5e6'], // Start color (light green)
            [1, '#43ab72']  // End color (darker green)
          ]
        };
      } else if (entry.status === 'heating') {
        color = {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, '#f0afad'],  // Start color (light red)
            [1, 'rgba(255, 0, 0, 1)']   // End color (darker red)
          ]
        };
      } else {
        color = {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, '#E0E0E0'],  // Start color (default light gray)
            [1, '#B1B1B1']   // End color (default darker gray)
          ]
        };
      }
      const time = entry.count >= 180 ? (entry.count / 180).toFixed(2) + ' hrs' : (entry.count / 3).toFixed(2) + ' mins';

      return {
        name: entry.status,
        y: formattedPercentage,
        color: color,
        time : time
      };
    });

    console.log(donutChartData);

    const options: Highcharts.Options = {
      chart: {
        type: 'pie'
      },
      title: {
        text: '   '
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        pie: {
          innerSize: '50%',
          /*dataLabels: {
            enabled: true,
            distance: -40, // Adjust the distance of labels from the center of the pie
            format: '{point.name}: {point.time}', // Include status and hours in the label
            style: {
              fontWeight: 'bold'
            }
          }*/
        }
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y}%</b> <br><b>({point.time})<b>'
      },
      series: [{
        type: 'pie',
        name: 'Time',
        data: donutChartData
      }]
    };

    Highcharts.chart('donutChart', options);
  }

  createChart() {
    Highcharts.chart('curvedLineChart', {
      chart: {
        type: 'spline'
      },
      title: {
        text: ''
      },
      credits: {
            enabled: false // Disable the credits display
          },

      xAxis: {
        type: 'datetime',
        timezoneOffset: 330
      },
      yAxis: {
        title: {
          text: 'Temperature'
        },
        min: 0,
        max: 100,
      },
      series: [{
        name: 'Temperature',
        color: {
          linearGradient: {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 1
          },
          stops: [
            [0, 'rgba(255, 0, 0, 1)'],    // Start color (red)
            [1, 'rgba(255, 255, 0, 0.3)'] // End color (yellow)
          ]
        },
        data: this.temperatureData
      }] as any
    } as Highcharts.Options);
  }

  createChart2() {
    Highcharts.chart('curvedLineChart2', {
      chart: {
        type: 'spline'
      },
      title: {
        text: ''
      },
      credits: {
            enabled: false // Disable the credits display
          },

      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {
          text: 'Humidity'
        },
        min: 0,
        max: 100,
      },
      series: [{
        name: 'Humitidy',
        color: {
          linearGradient: {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 1
          },
          stops: [
            [0, 'rgba(0, 0, 255, 1)'],    // Start color (blue)
            [1, 'rgba(0, 255, 255, 0.3)'] // End color (cyan)
          ]
        },
        data: this.humidityData
      }] as any
    } as Highcharts.Options);
  }

  createTemperature() {
    Highcharts.chart('temperatureRYB', {
      chart: {
        type: 'spline'
      },
      title: {
        text: ''
      },
      credits: {
        enabled: false 
      },
      xAxis: {
        type: 'datetime',
        timezoneOffset: 330
      },
      yAxis: {
        title: {
          text: 'Temperature RYB'
        },
        min: 0,
        max: 100,
      },
      series: [
        {
          name: 'Temperature R',
          color: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, 'rgba(255, 0, 0, 1)'],    // Start color (red)
              [1, 'rgba(255, 255, 0, 0.3)'] // End color (yellow)
            ]
          },
          data: this.temperatureRData,
          lineWidth: 3 // Set the line width to triple
        },
        {
          name: 'Temperature B',
          color: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, 'rgba(0, 0, 255, 1)'],    // Start color (blue)
              [1, 'rgba(0, 255, 255, 0.3)'] // End color (cyan)
            ]
          },
          data: this.temperatureBData,
          lineWidth: 3 // Set the line width to triple
        },
        {
          name: 'Temperature Y',
          color: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, 'rgba(255, 255, 0, 0.3)'],    // Start color (yellow)
              [1, 'rgba(255, 0, 0, 1)'] // End color (red)
            ]
          },
          data: this.temperatureYData,
          lineWidth: 3 // Set the line width to triple
        },
      ] as any
    } as Highcharts.Options);
  }
  
  

  openFilterDailog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '90vw';

    const dialogRef = this.dialog.open(FilterComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.data && result.dataStatus && result.device && result.deviceType) {
        sessionStorage.setItem('data', JSON.stringify(result.data));
        sessionStorage.setItem('dataStatus', JSON.stringify(result.dataStatus));
        sessionStorage.setItem('device', result.device);
        sessionStorage.setItem('deviceType', result.deviceType);
        this.DeviceType = result.deviceType;
        console.log("Filter Interval Device Type :- ", this.DeviceType);

        // Introduce a delay before processing the result
        setTimeout(() => {
          this.processChartData(result.data);
          this.createDonutChart(result.dataStatus.dataStatus);
          this.fetchDeviceInfo(result.device);
          this.router.navigate([this.router.url]);
        }, 1000); // Adjust the delay as needed
      } else {
        const sessionData = sessionStorage.getItem('data');
        const sessionDataStatus = sessionStorage.getItem('dataStatus');
        const sessionDevice = sessionStorage.getItem('device');
        const sessionDeviceType = sessionStorage.getItem('deviceType');

        if (sessionData && sessionDataStatus && sessionDevice && sessionDeviceType) {
          const jsonData = JSON.parse(sessionData);
          const jsonDataStatus = JSON.parse(sessionDataStatus);
          this.DeviceType = sessionDeviceType;
          console.log("Filter Close Device Type :- ", this.DeviceType);

          // Introduce a delay before processing the result
          setTimeout(() => {
            this.processChartData(jsonData);
            this.createDonutChart(jsonDataStatus.dataStatus);
            this.fetchDeviceInfo(sessionDevice);
            this.router.navigate([this.router.url]);
          }, 1000); // Adjust the delay as needed
        } else {
          this.snackBar.open('No session storage data available!', 'Dismiss', {
            duration: 2000
          });
          this.fetchDefaultData();
          this.router.navigate([this.router.url]);
        }
      }
    });
  }


  fetchDefaultData() {
    if(this.selectedDevice){
      this.DashDataService.dataLast(this.selectedDevice, this.selectedDeviceInterval).subscribe(
        (data: any) => {
          sessionStorage.setItem('data', JSON.stringify(data));
          sessionStorage.setItem('dataType', this.DeviceType);
          this.processChartData(data);
          this.DashDataService.dataLastStatus(this.selectedDevice, this.selectedDeviceInterval).subscribe(
            (dataStatus: any) => {
              sessionStorage.setItem('dataStatus', JSON.stringify(dataStatus));
              this.createDonutChart(dataStatus.dataStatus); 
            }
          );
        },
        (error) => {
          this.snackBar.open('Error while fetching last data!', 'Dismiss', {
            duration: 2000
          });
      }
      );
    }
    else{
      this.snackBar.open('Not Defined!', 'Dismiss', {
        duration: 2000
      });
    }
  }

  // processChartData(response: any) {
  //   const data = response.data; 
  //   const istOffset = 5.5 * 60 * 60 * 1000; 



  //   this.temperatureYData = data.map((entry: any) => [
  //     new Date(entry.TimeStamp).getTime() + istOffset,
  //     entry.TemperatureY
  //   ]);


  //   this.temperatureBData = data.map((entry: any) => [
  //     new Date(entry.TimeStamp).getTime() + istOffset,
  //     entry.TemperatureB
  //   ]);

  //   this.humidityData = data.map((entry: any) => [
  //     new Date(entry.TimeStamp).getTime() + istOffset,
  //     entry.Humidity
  //   ]);
  //   this.timestampData = data.map((entry: any) =>
  //     new Date(entry.TimeStamp).getTime() + istOffset
  //   );
  //   if(this.DeviceType === 'th'){
  //     this.createChart();
  //     this.createChart2();
  //     console.log("processChartData Function", this.temperatureData);
  //     console.log("processChartData Function", this.humidityData);
  //   } else if(this.DeviceType === 't'){
  //     this.createChart();
  //     console.log("processChartData Function", this.temperatureData);
  //   } else if(this.DeviceType  === 'ryb'){
  //     this.createTemperature();

  //     console.log("temperatureRData", this.temperatureRData);
  //     console.log("temperatureYData", this.temperatureYData);
  //     console.log("temperatureBData", this.temperatureBData);
  //   } else{
  //     console.log("Device Tyopee is  not found!!")
  //   }
  // }

  processChartData(response: any) {
    const data = response.data;
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset: +5:30 in milliseconds

    this.temperatureData = data.map((entry: any) => [
      new Date(entry.TimeStamp).getTime() + istOffset,
      entry.Temperature
    ]);

    this.humidityData = data.map((entry: any) => [
          new Date(entry.TimeStamp).getTime() + istOffset,
          entry.Humidity
        ]);

    // Convert TemperatureR, TemperatureY, and TemperatureB values to numbers
    this.temperatureRData = data.map((entry: any) => [
      new Date(entry.TimeStamp).getTime() + istOffset,
      parseFloat(entry.TemperatureR)
    ]);
  
    this.temperatureYData = data.map((entry: any) => [
      new Date(entry.TimeStamp).getTime() + istOffset,
      parseFloat(entry.TemperatureY)
    ]);
  
    this.temperatureBData = data.map((entry: any) => [
      new Date(entry.TimeStamp).getTime() + istOffset,
      parseFloat(entry.TemperatureB)
    ]);
  
    this.timestampData = data.map((entry: any) =>
      new Date(entry.TimeStamp).getTime() + istOffset
    );
  
    if (this.DeviceType === 'th') {
      this.createChart();
      this.createChart2();
    } else if (this.DeviceType === 't') {
      this.createChart();
    } else if (this.DeviceType === 'ryb') {
      this.createTemperature();
    } else {
      console.log("Device Type is not found!");
    }
  }
  


  fetchDeviceInfo(deviceId: string) {
    this.DashDataService.deviceDetails(deviceId).subscribe(
      (deviceDetailsResult: any) => {
        this.DeviceName = deviceDetailsResult[0].DeviceName;
        this.DashDataService.deviceStatus(deviceId).subscribe(
          (dataStatusResult: any) => {
            this.DeviceStatus = dataStatusResult[0].Status;
            const lastUpdatedTime = dataStatusResult[0].TimeStamp;
            this.DeviceLastUpdatedTime = this.formatTime(lastUpdatedTime);
            this.DashDataService.deviceTrigger(deviceId).subscribe(
              (deviceTriggerResult: any) => {
                this.DeviceTrigger = deviceTriggerResult[0].TriggerValue;
                this.loading1 = false;
              }
            );
          }
        );
      },
      (error) => {
        this.snackBar.open('Error while fetching last data!', 'Dismiss', {
          duration: 2000
        });
      }
    ); 
  }

  formatTime(lastUpdatedTime: string): string {
    const currentTime = new Date();
    const updatedTime = new Date(lastUpdatedTime);
    const diff = Math.abs(currentTime.getTime() - updatedTime.getTime()) / 1000; // Time difference in seconds

    if (diff < 60) {
      return `${Math.floor(diff)} sec ago`;
    } else if (diff < 3600) {
      const mins = Math.floor(diff / 60);
      return `${mins} min ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} hour ago`;
    } else {
      const formattedTime = this.datePipe.transform(updatedTime, 'yyyy-MM-dd hh:mm:ss');
      return formattedTime || ''; 
    }
  }

  refresh(){
    const deviceId = sessionStorage.getItem('device');
    if(deviceId){
      this.fetchDeviceInfo(deviceId);
    }
  }
}
