import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PostListComponent } from './pages/post-list/post-list.component';
import { RoutePaths } from './app.constants';
import { PostComponent } from './pages/post/post.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { CreditsComponent } from './components/credits/credits.component';




export const routes: Routes = [
//   {path: '', loadChildren: () => import('./home/home.component').then(m => m.HomeComponent)}
    {path: RoutePaths.home, component: HomeComponent },
    {path: `${RoutePaths.posts}/:id/:name`, component: PostListComponent },
    {path: `${RoutePaths.post}/:catid/:catname/:id/:name`, component: PostComponent },
    {path: RoutePaths.credits, component: CreditsComponent},
    {path: '**', component: PageNotFoundComponent}
];

export default routes;