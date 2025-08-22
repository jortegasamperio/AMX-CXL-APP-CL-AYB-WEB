import { Routes } from '@angular/router';
import { Login } from './modules/login/login';
import { Home } from './modules/home/home';
import { Topbar } from './modules/shared/topbar/topbar';
import { MenuPreselect } from './modules/menu-preselect/menu-preselect';
import { AddMenu } from './modules/menu-preselect/components/add-menu/add-menu';
import { PageMenu } from './modules/menu-preselect/components/page-menu/page-menu';
import { EditMenu } from './modules/menu-preselect/components/edit-menu/edit-menu';
import { DuplicateMenu } from './modules/menu-preselect/components/duplicate-menu/duplicate-menu';
import { CatCodePreselect } from './modules/cat-code-preselect/cat-code-preselect';
import { CatRutasVuelo } from './modules/cat-rutas-vuelo/cat-rutas-vuelo';
import { CatCodeSpecialMeal } from './modules/cat-code-special-meal/cat-code-special-meal';
import { CatEmailReport } from './modules/cat-email-report/cat-email-report';

export const routes: Routes = [
    { path: 'login', component: Login },
    {
        path: 'alimentos-bebidas',
        component: Topbar,
        children: [
            {
                path: '',
                component: Home
            },
            {
                path: 'menu-preselect',
                component: MenuPreselect,
                children: [
                    {
                        path: '',
                        component: PageMenu,
                    },
                    {
                        path: 'add-menu',
                        component: AddMenu,
                    },
                    {
                        path: 'edit-menu',
                        component: EditMenu,
                    },
                    {
                        path: 'duplicate-menu',
                        component: DuplicateMenu,
                    }
                ]
            },
            {
                path: 'cat-code-preselect',
                component: CatCodePreselect
            },
            {
                path: 'cat-rutas-vuelo',
                component: CatRutasVuelo
            },
            {
                path: 'cat-code-special-meal',
                component: CatCodeSpecialMeal
            },
            {
                path: 'cat-email-report',
                component: CatEmailReport
            }
        ]
    },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];
