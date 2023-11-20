import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DashDataService } from '../../dash-data-service/dash-data.service';
import { AuthService } from '../../../login/auth/auth.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddUserComponent } from '../../dash-component/add-user/add-user.component';
import { AddDeviceComponent } from '../../dash-component/add-device/add-device.component';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import{ DashService } from '../../dash.service';


@Component({
  selector: 'app-user-manage',
  templateUrl: './user-manage.component.html',
  styleUrls: ['./user-manage.component.css']
})
export class UserManageComponent implements OnInit, OnDestroy {
  CompanyEmail!: string | null;
  displayedColumns: string[] = ['Name', 'Contact', 'Designation', 'Status'];
  displayedColumns2: string[] = ['DeviceName', 'Location', 'IssueDate', 'Status','DeviceType'];
  dataSource: UserData[] = [];
  dataSource2: DeviceData[] = [];
  totalUsers: number = 0;
  totalOnlineUsers: number = 0;
  totalOfflineUsers: number = 0;
  totalDevices: number = 0;
  totalActiveDevices: number = 0;
  totalInactiveDevices: number = 0;
  intervalSubscription: Subscription | undefined;

  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    private dashDataService: DashDataService,
    private datePipe: DatePipe,
    public dashService: DashService
  ) {}

  ngOnInit() {
    this.fetchData();
    this.startInterval();
    this.dashService.isPageLoading(true);
  }

  ngOnDestroy() {
    this.stopInterval();
  }

  startInterval() {
    this.intervalSubscription = interval(5000)
      .pipe(take(Infinity))
      .subscribe(() => {
        this.fetchData();
      });
  }

  stopInterval() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  fetchData() {
    this.fetchUsers();
    this.fetchDevices();
  }

  fetchUsers() {
    this.CompanyEmail = sessionStorage.getItem('CompanyEmail');
    if (this.CompanyEmail) {
      this.dashDataService.companyUsers(this.CompanyEmail).subscribe(
        (users) => {
          this.dataSource = users.map((user: UserData) => {
            user.status = user.is_online === 1 ? 'Online' : 'Offline';
            return user;
          });
          this.totalUsers = users.length;
          this.totalOnlineUsers = this.dataSource.filter(user => user.is_online === 1).length;
          this.totalOfflineUsers = this.dataSource.filter(user => user.is_online === 0).length;
          this.dashService.isPageLoading(false);
        },
        (error) => {
          // Handle error
        }
      );
    }
  }

  fetchDevices() {
    if (this.CompanyEmail) {
      this.dashDataService.userDevices(this.CompanyEmail).subscribe(
        (devices: any) => {
          this.dataSource2 = devices.devices.map((device: DeviceData) => {
            device.formattedIssueDate = this.datePipe.transform(device.IssueDate, 'yyyy-MM-dd HH:mm:ss');
            return device;
          });

          this.dataSource2 = devices.devices.map((device: DeviceData) => {
            if (device.status === "online" || device.status === "heating") {
              device.Status = 'Online';
            } else {
              device.Status = 'Offline';
            }
            return device;
          });          

          this.totalDevices = this.dataSource2.length;
          this.totalActiveDevices = this.dataSource2.filter(devices => devices.status === "online" || devices.status === "heating").length;
          this.totalInactiveDevices = this.dataSource2.filter(devices => devices.status === "offline" ).length;
          this.dashService.isPageLoading(false);
        },
        (error) => {
          console.log('Error while fetching user devices!');
        }
      );
    }
  }

  openAddUserDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '90vw';
    const dialogRef = this.dialog.open(AddUserComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(userAdded => {});
  }

  openAddDeviceDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '90vw';
    const dialogRef = this.dialog.open(AddDeviceComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(deviceAdded => {});
  }
}

export interface UserData {
  FirstName: string;
  LastName: string;
  ContactNo: string;
  PersonalEmail: string;
  Designation: string;
  UserType: string;
  is_online: number;
  status: string;
}

export interface DeviceData {
  DeviceUID: string;
  DeviceLocation: string;
  DeviceName: string;
  IssueDate: string;
  is_active: number;
  Status: string;
  formattedIssueDate: string | null;
  status: String;
}
