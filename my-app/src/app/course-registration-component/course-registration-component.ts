import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CourseRegistration } from '../Classes/CourseRegistration';

@Component({
  selector: 'app-course-registration-component',
  standalone: false,
  templateUrl: './course-registration-component.html',
  styleUrl: './course-registration-component.css',
})
export class CourseRegistrationComponent {
  // Initialize the object to bind it to the UI
  courseModel = new CourseRegistration();
  onSubmit()
  {
    let infor=this.courseModel.getInfor()
    console.log('Course data:', this.courseModel.getInfor());
    alert(infor)
  }
}