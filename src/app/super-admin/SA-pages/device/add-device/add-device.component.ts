import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { SuperAdminService } from 'src/app/super-admin/super-admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/login/auth/auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DeviceComponent } from '../device.component';


@Component({
  selector: 'app-add-device',
  templateUrl: './add-device.component.html',
  styleUrls: ['./add-device.component.css']
})
export class AddDeviceComponent {
  deviceName: string = '';
  deviceLocation:string ='';
  deviceUid: string = '';
  TriggerValue:string = '';
   CompanyEmail:string = '';
   CompanyName:string = '';
  sms:string = '';
  Email:string = '';
 
  
  formData: any = {};

  constructor(private service: SuperAdminService, private snackBar: MatSnackBar,private AuthService:AuthService,
    public dialogRef: MatDialogRef<DeviceComponent>,
  ) {}

  onSubmit() {
  this.service.addDevice(this.formData).subscribe(response => {
    const message = 'API Response:' + JSON.stringify(response);
     console.log(message);
   //  console.log(this.CompanyEmail);
   //  console.log(this.CompanyName);
    this.snackBar.open(message, 'Close',{
      duration: 5000, 
      horizontalPosition: 'center',
      verticalPosition: 'bottom', 
    });
  });
  }
  
 //  CompanyEmail = this.service.getCompanyEmail();
 //  CompanyName = this.service.getCompanyName();
  

  onSaveClick(): void {
    if(this.formData.valid){
      const deviceData = {
        DeviceUID: this.deviceUid,
        DeviceLocation: this.deviceLocation,
        DeviceName: this.deviceName,
        CompanyEmail: this.CompanyEmail,
        CompanyName: this.CompanyName,
        SMS: this.sms,
        email:this.Email,
      }
      const triggerData = {
        DeviceUID: this.deviceUid,
        TriggerValue: this.TriggerValue,
        CompanyEmail: this.CompanyEmail
      }
      this.service.addDevice(deviceData).subscribe(
        () =>{
         this.service.addDeviceTrigger(triggerData).subscribe(
           () => {

              this.snackBar.open('Device Added Successful!', 'Dismiss', {
                duration: 2000
              });
              this.dialogRef.close();
            },
            (error) => {
              this.snackBar.open(
                error.error.message || 'Failed to set Trigger. Please try again.',
                'Dismiss',
                { duration: 2000 }
              );
            }
        );
      },
      (error) => {
        this.snackBar.open(
            error.error.message || 'Failed to add Device. Please try again.',
            'Dismiss',
            { duration: 2000 }
          );
        this.dialogRef.close();
      });
    }
  }
}

