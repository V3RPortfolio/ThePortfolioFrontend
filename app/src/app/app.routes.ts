import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PostListComponent } from './pages/post-list/post-list.component';
import { RoutePaths } from './app.constants';
import { PostComponent } from './pages/post/post.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { CreditsComponent } from './components/credits/credits.component';
import { AboutComponent } from './pages/about/about.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';




export const routes: Routes = [
//   {path: '', loadChildren: () => import('./home/home.component').then(m => m.HomeComponent)}
    {path: RoutePaths.home, component: HomeComponent },
    {path: `${RoutePaths.posts}/:id/:name`, component: PostListComponent },
    {path: `${RoutePaths.post}/:catid/:catname/:id/:name`, component: PostComponent },
    {path: RoutePaths.credits, component: CreditsComponent},
    {path: RoutePaths.about, component: AboutComponent},
    {path: RoutePaths.login, component: LoginComponent},
    {path: RoutePaths.dashboard, component: DashboardComponent, canActivate: [authGuard]},
    {path: '**', component: PageNotFoundComponent}
];

export default routes;