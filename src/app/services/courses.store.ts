import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { Course, sortCoursesBySeqNo } from "../model/course";
import { catchError, map, shareReplay, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { LoadingService } from "../loading/loading.service";
import { MessagesService } from "../messages/messages.service";

@Injectable({
    providedIn: 'root'
})
export class CoursesStore {

    private subject = new BehaviorSubject<Course[]>([]);

    courses$: Observable<Course[]> = this.subject.asObservable();
    
    constructor(
        private http: HttpClient,
        private loading: LoadingService,
        private messages: MessagesService
    ){
        this.loadAllCourses();
    }
        
    private loadAllCourses() {
        const loadCourses$ =  this.http.get<Course[]>('/api/courses').pipe(
            map(resp => resp["payload"]),
            catchError(err => {
                const msg = "Não foi possível carregar os cursos";
                this.messages.showErrors(msg);
                console.log(msg, err);
                return throwError(err);
                
            }),
            tap(courses => this.subject.next(courses))
        );

        this.loading.showLoaderUntilCompleted(loadCourses$)
            .subscribe();

    }

    filterByCategory(category: string): Observable<Course[]>{
        return this.courses$.pipe(
            map(
                courses => courses.filter(c => c.category == category)
                    .sort(sortCoursesBySeqNo)
            )
        );
    }

    saveCourse(courseId: string, changes: Partial<Course>): Observable<any> {

        const courses = this.subject.getValue();

        const index = courses.findIndex(c => c.id == courseId);

        const newCourse: Course = {
            ...courses[index],
            ...changes
        };

        const newCourses: Course[] = courses.slice(0);
        newCourses[index] = newCourse;

        this.subject.next(newCourses);

        return this.http.put(`/api/courses/${courseId}`, changes)
            .pipe(
                catchError(err => {
                    const msg = "Não foi possível salvar o curso";
                    console.log(msg, err);
                    this.messages.showErrors(msg);
                    return throwError(err);
                }),
                shareReplay()
            )
        ;

    }

}