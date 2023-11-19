import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EditDeviceComponent } from '../../dash-component/edit-device/edit-device.component';
import { TriggerDeviceComponent } from '../../dash-component/trigger-device/trigger-device.component';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { AuthService } from '../../../login/auth/auth.service';
import { Subscription } from 'rxjs';
import { MqttService, IMqttMessage } from 'ngx-mqtt';
import{ DashService } from '../../dash.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-temp',
  templateUrl: './temp.component.html',
  styleUrls: ['./temp.component.css']
})
export class TempComponent implements OnInit, OnDestroy {
  userDevices: any[] = [];
  CompanyEmail!: string | null; 
  mqttSubscriptions: Subscription[] = [];
  deviceData: any[] = [];
  userDevicesTrigger: any[] = [];

  constructor(
    public dialog: MatDialog,
    private dashDataService: DashDataService,
    private authService: AuthService,
    private mqttService: MqttService,
    public dashService: DashService,
    public snackBar: MatSnackBar,
  ) {}



  ngOnInit() {
    this.getUserDevices();
    this.getUserDevicesTrigger();
    this.dashService.isPageLoading(true);
  }

  ngOnDestroy() {
    this.unsubscribeFromTopics();
  }

  getUserType(): string | null {
    return this.authService.getUserType();
  }

  getUserDevices() {
    this.CompanyEmail = this.authService.getCompanyEmail();
    if (this.CompanyEmail) {
      this.dashDataService.userDevices(this.CompanyEmail).subscribe(
        (devices: any) => {
          this.userDevices = devices.devices;
          this.subscribeToTopics();
          this.dashService.isPageLoading(false);
        },
        (error) => {
          this.snackBar.open('Error while fetching user devices!', 'Dismiss', {
            duration: 2000
          });
        }
      );
    } 
  }

  getUserDevicesTrigger() {
    this.CompanyEmail = this.authService.getCompanyEmail();
     if (this.CompanyEmail) {
      this.dashDataService.fetchTriggerAll(this.CompanyEmail).subscribe(
        (triggers: any) => {
          this.userDevicesTrigger = triggers.triggers;
        },
        (error) => {
          this.snackBar.open('Error while fetching user devices!', 'Dismiss', {
            duration: 2000
          });
        }
      );
    } 
  }

  openEditDeviceDialog(device: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.data = { device };
    const dialogRef = this.dialog.open(EditDeviceComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(updatedDevice => {});
  }

  openTriggerDeviceDialog(device: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.data = { device };
    const dialogRef = this.dialog.open(TriggerDeviceComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(updatedDevice => {
      this.getUserDevicesTrigger();
    });
  }

  subscribeToTopics() {
    this.deviceData = [];
    this.userDevices.forEach(device => {
      const topic = `sense/live/${device.DeviceUID}`;
      const subscription = this.mqttService.observe(topic).subscribe((message: IMqttMessage) => {
        const payload = message.payload.toString();
        const deviceData = JSON.parse(payload);

        const index = this.userDevices.findIndex(d => d.DeviceUID === device.DeviceUID);
        if (index !== -1) {
          this.deviceData[index] = deviceData;
        }
      });

      this.mqttSubscriptions.push(subscription);
    });
  }

  unsubscribeFromTopics() {
    this.mqttSubscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.mqttSubscriptions = [];
  }

  getIndex(deviceUid: string): number {
    return this.userDevices.findIndex(device => device.DeviceUID === deviceUid);
  }

  isDeviceConnected(deviceUid: string): boolean {
    const deviceData = this.deviceData[this.getIndex(deviceUid)];
    if (deviceData) {
      const timestamp = new Date(deviceData.Timestamp);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - timestamp.getTime();
      const minutesDifference = Math.floor(timeDifference / 1000 / 60); // Convert milliseconds to minutes

      // Check if the data is within the last 5 minutes (300 seconds)
      return minutesDifference <= 5;
    }
    return false; // Device data not available, consider it disconnected
  }

  isDeviceHeated(deviceUid: string): boolean {
    const deviceTrigger = this.deviceData[this.getIndex(deviceUid)];
    if (deviceTrigger) {
      const trigger = this.userDevicesTrigger.find(trigger => trigger.DeviceUID === deviceUid);
      if (trigger && deviceTrigger.Temperature) {
        const triggerValue = trigger.TriggerValue;
        const temperature = deviceTrigger.Temperature;
        const isHeated = temperature > triggerValue;     
        return isHeated;
      }
    }
    return false; // Device or trigger not found, or missing temperature value
  }

}




