from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='StudyPet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pet_type', models.CharField(choices=[('cat', 'Кот'), ('dragon', 'Дракон'), ('robot', 'Робот')], default='cat', max_length=20)),
                ('level', models.PositiveIntegerField(default=1)),
                ('xp', models.PositiveIntegerField(default=0)),
                ('streak_days', models.PositiveIntegerField(default=0)),
                ('last_streak_date', models.DateField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=models.CASCADE, related_name='studypet', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'study_pets',
                'verbose_name': 'StudyPet',
                'verbose_name_plural': 'StudyPets',
            },
        ),
    ]
