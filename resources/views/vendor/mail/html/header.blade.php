@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}">
<table cellpadding="0" cellspacing="0" role="presentation" align="center">
<tr>
<td style="padding-right: 12px;">
<img src="{{ asset('images/logo-email.jpg') }}" width="40" height="40" alt="{{ config('app.name') }}" class="logo">
</td>
<td style="text-align: left;">
<div class="brand-name">{{ config('app.name') }}</div>
<div class="brand-tagline">Shop Smart. Live Better.</div>
</td>
</tr>
</table>
</a>
</td>
</tr>
