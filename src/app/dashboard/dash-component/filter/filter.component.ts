import { Component, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { AuthService } from '../../../login/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import 'jspdf-autotable';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent {

  CompanyEmail!: string | null;
  selectedDevice!: FormControl;
  selectedDeviceType!: any;
  selectedDeviceInterval!: FormControl;
  deviceOptions: any[] = [];
  selectedRadioButton: string = 'Last';
  startDate!: Date;
  endDate!: Date;

  @HostListener('window:resize')
  onWindowResize() {
    this.adjustDialogWidth();
  }

  constructor(
    private DashDataService: DashDataService,
    private authService: AuthService,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<FilterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.adjustDialogWidth();
    this.selectedDevice = new FormControl(this.deviceOptions.length > 0 ? this.deviceOptions[0].DeviceUID : '', [Validators.required]);
    this.selectedDeviceInterval = new FormControl('1hour');
    this.getUserDevices();

    // Set end date as the current date
    this.endDate = new Date();

    // Set start date as one day before the current date
    const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
    const currentDate = new Date();
    currentDate.setTime(currentDate.getTime() - oneDay);
    this.startDate = currentDate;

    // Subscribe to changes in selectedDevice and update selectedDeviceType
    this.selectedDevice.valueChanges.subscribe((newDeviceUID) => {
      const selectedDevice = this.deviceOptions.find(device => device.DeviceUID === newDeviceUID);
      this.selectedDeviceType = selectedDevice ? selectedDevice.DeviceType : null;
    });
  }

  downloadPDF() {
    const backendResponse = sessionStorage.getItem('data');
    if (backendResponse !== null) {
      const parsedData = JSON.parse(backendResponse);
      const dataArray = parsedData.data;
      const jsPDF = require('jspdf');
      const columns = Object.keys(dataArray[0]);
      const rows = dataArray.map((item: Record<string, string | number>) => Object.values(item));
    
      const doc = new jsPDF.default();
    
      doc.autoTable({
        head: [columns],
        body: rows,
      });
    
      doc.save('report_data.pdf');
    } else {
      this.snackBar.open('No data found!', 'Dismiss', {
        duration: 2000
      });
    }
  }

  adjustDialogWidth() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 600) {
      this.dialogRef.updateSize('90%', '');
    } else if (screenWidth <= 960) {
      this.dialogRef.updateSize('70%', '');
    } else {
      this.dialogRef.updateSize('400px', '');
    }
  }

  getUserDevices() {
    this.CompanyEmail = this.authService.getCompanyEmail();
    if (this.CompanyEmail) {
      this.DashDataService.userDevices(this.CompanyEmail).subscribe(
        (devices: any) => {
          this.deviceOptions = devices.devices;
          if (this.deviceOptions.length > 0) {
            this.selectedDevice.setValue(this.deviceOptions[0].DeviceUID);
            this.selectedDeviceType = this.deviceOptions[0].DeviceType;
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

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    if (this.selectedRadioButton === 'Last') {
      if (this.selectedDevice.value) {
        const device = this.selectedDevice.value;
        const interval = this.selectedDeviceInterval.value;
        const deviceType = this.selectedDeviceType;

        this.DashDataService.dataLast(device, interval).subscribe(
          (resultData: any) => {
            const data = resultData;
            this.DashDataService.dataLastStatus(device, interval).subscribe(
              (resultDataStatus: any) => {
                const dataStatus = resultDataStatus;
                this.dialogRef.close({ data, dataStatus, device, deviceType });
              },
              (error) => {
                this.snackBar.open('Error while fetching last data status!', 'Dismiss', {
                  duration: 2000
                });
              }
            );
          },
          (error) => {
            this.snackBar.open('Error while fetching last data!', 'Dismiss', {
              duration: 2000
            });
          }
        );
      } else {
        this.snackBar.open('No device has been selected!', 'Dismiss', {
          duration: 2000
        });
      }
    } else if (this.selectedRadioButton === 'timePeriod') {
      if (this.selectedDevice.value) {
        const device = this.selectedDevice.value;
        const formattedStartDate = this.startDate.toISOString().split('T')[0];
        const formattedEndDate = this.endDate.toISOString().split('T')[0];
        const deviceType = this.selectedDeviceType;

        this.DashDataService.DataByCustomDate(device, formattedStartDate, formattedEndDate).subscribe(
          (resultData: any) => {
            const data = resultData;
            this.DashDataService.DataByCustomDateStatus(device, formattedStartDate, formattedEndDate).subscribe(
              (resultDataStatus: any) => {
                const dataStatus = resultDataStatus;
                this.dialogRef.close({ data, dataStatus, device, deviceType });
              },
              (error) => {
                this.snackBar.open('Error while fetching data status by custom date!', 'Dismiss', {
                  duration: 2000
                });
              }
            );
          },
          (error) => {
            this.snackBar.open('Error while fetching data by custom date!', 'Dismiss', {
              duration: 2000
            });
          }
        );
      } else {
        this.snackBar.open('No device has been selected!', 'Dismiss', {
          duration: 2000
        });
      }
    }
  }
}
