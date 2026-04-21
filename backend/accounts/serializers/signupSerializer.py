from rest_framework import serializers

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from accounts.models import User



class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={
        'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={
        'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']


    def validate_username(self, value):
        # try:
        #     User.objects.get(username=value)
        #     raise serializers.ValidationError({'Username already exist!'})
        # except User.DoesNotExist:
        #     pass
        if any(ch.isupper() for ch in value):
            raise serializers.ValidationError(
                {'Username must be lowercase!'})
        if len(value) < 4:
            raise serializers.ValidationError(
                {'Username must be at least 4 characters!'})
        if len(value) > 14:
            raise serializers.ValidationError(
                {'Username must be at most 14 characters!'})
        return value

    # def validate_email(self, value):
    #     try:
    #         User.objects.get(email=value)
    #         raise serializers.ValidationError({'Email already exist!'})
    #     except User.DoesNotExist:
    #         pass
    #     return value

    def validate_password(self, value):
        if value != value.strip():
            raise serializers.ValidationError(
                {'Password cannot start or end with whitespace!'})
        return value.strip()

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {'password': 'Passwords do not match'})
        try:
            tmp_user = User(username=attrs['username'], email=attrs['email'])
            validate_password(password=attrs['password'], user=tmp_user)
        except ValidationError as exc:
            raise serializers.ValidationError({'password': exc.messages})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.is_password_set = True
        user.is_active = False
        user.save()
        return user