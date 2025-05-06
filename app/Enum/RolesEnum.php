<?php

namespace App\Enum;

enum RolesEnum: string
{
    case Admin = 'admin';

    case Commenter = 'commenter';
    case User = 'user'; 
}
